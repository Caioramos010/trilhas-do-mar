import { autorizarEquipe } from './drive-sessao.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const auth = autorizarEquipe(request, env);
  if (!auth.ok) return json({ ok: false, erro: auth.motivo }, 403);

  if (!env.GEMINI_API_KEY) {
    return json({
      ok: false,
      configured: false,
      erro: 'GEMINI_API_KEY não configurada no Cloudflare Pages.',
    }, 501);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, erro: 'JSON inválido.' }, 400);
  }

  const modelo = String(body.modelo || 'acao_ambiental');
  const tema = String(body.tema || 'Coleta de lixo na Lagoinha do Leste').slice(0, 300);
  const condicaoMar = String(body.condicaoMar || 'Mar aberto').slice(0, 60);
  const arquivos = Array.isArray(body.arquivos) ? body.arquivos.slice(0, 10) : [];

  const prompt = [
    'Você é o diretor criativo da Trilhas do Mar (Pântano do Sul, Florianópolis/SC).',
    'REGRA OPERACIONAL REAL: Os pilotos das lanchas NUNCA gravam vídeo. Quem grava é exclusivamente o apoio na praia (colocando coletes no Pântano do Sul ou na areia da Lagoinha) e o apoio durante o translado.',
    'REFERÊNCIA DE MARCA: Estilo orgânico e ambiental inspirado na Ecoar Turismo (@ecoar_turismo), com verdade operacional e sem promessas irreais sobre o mar.',
    'REGRA DE FORMATO: Proibido usar emoji ou travessão. Frases faladas curtas (máx. 10 palavras). Troca visual a cada 2-3 segundos.',
    `MODELO ESCOLHIDO: ${modelo}`,
    `TEMA / PAUTA DO DIA: ${tema}`,
    `CONDIÇÃO DO MAR HOJE: ${condicaoMar}`,
    arquivos.length ? `ARQUIVOS BRUTOS DO DRIVE: ${JSON.stringify(arquivos)}` : '',
    'Devolva APENAS JSON válido no formato:',
    '{',
    '  "titulo": "Título curto do Reel",',
    '  "legendaInstagram": "Legenda pronta sem emojis excessivos com CTA para WhatsApp",',
    '  "teleprompter": "Texto falado contínuo de 15 a 20 segundos em frases curtas",',
    '  "cenas": [',
    '    { "tempo": "0-2s", "quemGrava": "Apoio Pântano (Coletes) | Apoio Translado | Apoio Praia Lagoinha", "visual": "O que filmar na prática", "tela": "Texto curto de até 5 palavras em #04161b/#5fb733" }',
    '  ]',
    '}',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
    const gemRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });
    const gemData = await gemRes.json();
    if (!gemRes.ok) {
      return json({ ok: false, erro: gemData.error?.message || 'Erro na API Gemini' }, 502);
    }
    const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);
    return json({ ok: true, configured: true, resultado: parsed });
  } catch (err) {
    return json({ ok: false, erro: err.message || 'Falha ao gerar roteiro na IA' }, 500);
  }
}
