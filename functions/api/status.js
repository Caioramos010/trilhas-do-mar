function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequestGet({ env }) {
  const driveOAuth = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && env.GOOGLE_DRIVE_FOLDER_ID);
  const driveSA = Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON && env.GOOGLE_DRIVE_FOLDER_ID);
  const emails = String(env.EQUIPE_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return json({
    ok: true,
    servicos: {
      drive: driveOAuth || driveSA,
      driveModo: driveOAuth ? 'oauth_empresa' : driveSA ? 'service_account' : 'desconectado',
      gemini: Boolean(env.GEMINI_API_KEY),
      loginTrava: emails.length > 0 || Boolean(env.TEAM_PIN),
    },
    equipeAutorizada: emails.length,
  });
}
