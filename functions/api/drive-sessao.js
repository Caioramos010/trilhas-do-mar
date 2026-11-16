function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function autorizarEquipe(request, env) {
  const lista = String(env.EQUIPE_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const pinConfig = String(env.TEAM_PIN || '').trim();

  if (lista.length === 0 && !pinConfig) return { ok: true, modo: 'aberto' };

  const emailReq = String(request.headers.get('x-trilhas-email') || '').trim().toLowerCase();
  const pinReq = String(request.headers.get('x-trilhas-pin') || '').trim();

  if (pinConfig && pinReq !== pinConfig) {
    return { ok: false, motivo: 'PIN da equipe inválido ou ausente.' };
  }
  if (lista.length > 0 && !lista.includes(emailReq)) {
    return { ok: false, motivo: 'E-mail fora dos 4 acessos autorizados da Trilhas do Mar.' };
  }
  return { ok: true, email: emailReq || 'equipe' };
}

function b64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function tokenViaServiceAccount(saJson) {
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const header = b64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const pem = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, '');
  const rawKey = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    rawKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(`${header}.${claim}`));
  const assertion = `${header}.${claim}.${b64UrlEncode(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Falha OAuth Service Account');
  return data.access_token;
}

async function tokenViaRefresh(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Falha ao renovar token Google Drive');
  return data.access_token;
}

async function garantirSubpasta(token, parentId, nomePasta) {
  const seguro = String(nomePasta || 'Geral').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 60);
  const q = `name='${seguro}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const busca = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (busca.ok) {
    const lista = await busca.json();
    if (lista.files && lista.files.length > 0) return lista.files[0].id;
  }

  const cria = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: seguro,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  const pasta = await cria.json();
  if (!cria.ok) throw new Error(pasta.error?.message || 'Erro ao criar subpasta no Google Drive');
  return pasta.id;
}

export async function onRequestPost({ request, env }) {
  const auth = autorizarEquipe(request, env);
  if (!auth.ok) return json({ ok: false, erro: auth.motivo }, 403);

  const rootFolder = env.GOOGLE_DRIVE_FOLDER_ID;
  const usaOAuth = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && rootFolder);
  const usaSA = Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON && rootFolder);

  if (!usaOAuth && !usaSA) {
    return json({
      ok: false,
      configured: false,
      erro: 'Google Drive ainda não configurado nas variáveis do Cloudflare Pages.',
    }, 501);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, erro: 'JSON inválido.' }, 400);
  }

  const fileName = String(body.fileName || 'midia-trilhas.mp4').slice(0, 140);
  const mimeType = String(body.mimeType || 'video/mp4');
  const folderTag = String(body.folderTag || '01-Embarque-e-Coletes');
  const origin = request.headers.get('Origin') || 'https://trilhasdomar.com';

  try {
    const token = usaOAuth ? await tokenViaRefresh(env) : await tokenViaServiceAccount(env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const pastaId = await garantirSubpasta(token, rootFolder, folderTag);

    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json; charset=UTF-8',
        'x-upload-content-type': mimeType,
        Origin: origin,
      },
      body: JSON.stringify({
        name: fileName,
        parents: [pastaId],
        description: `Enviado via Painel Trilhas do Mar · Frente: ${body.originTag || 'Apoio'} · Nota: ${body.note || '-'}`,
      }),
    });

    const uploadUrl = initRes.headers.get('Location');
    if (!initRes.ok || !uploadUrl) {
      const txt = await initRes.text();
      return json({ ok: false, erro: `Google Drive recusou início do upload: ${txt.slice(0, 200)}` }, 502);
    }

    return json({
      ok: true,
      configured: true,
      uploadUrl,
      pastaId,
      folderTag,
    });
  } catch (err) {
    return json({ ok: false, erro: err.message || 'Erro interno ao gerar sessão do Google Drive' }, 500);
  }
}
