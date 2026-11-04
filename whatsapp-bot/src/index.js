// Cloudflare Worker: webhook da WhatsApp Cloud API do Trilhas do Mar.
import { criarApi } from "./whatsapp.js";
import { tratarMensagem, tratarEcoDaEquipe } from "./bot.js";

const enc = new TextEncoder();

async function assinaturaValida(segredo, corpo, cabecalho) {
  if (!segredo || !cabecalho || !cabecalho.startsWith("sha256=")) return false;
  const chave = await crypto.subtle.importKey(
    "raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", chave, enc.encode(corpo)));
  const esperado = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  const recebido = cabecalho.slice(7).toLowerCase();
  if (recebido.length !== esperado.length) return false;
  let dif = 0;
  for (let i = 0; i < esperado.length; i++) dif |= esperado.charCodeAt(i) ^ recebido.charCodeAt(i);
  return dif === 0;
}

export async function processarWebhook(payload, deps) {
  const resultados = [];
  for (const entrada of payload?.entry || []) {
    for (const mudanca of entrada.changes || []) {
      const valor = mudanca.value || {};
      // Só responde mensagens do número configurado.
      if (valor.metadata?.phone_number_id && deps.env.PHONE_NUMBER_ID &&
          valor.metadata.phone_number_id !== deps.env.PHONE_NUMBER_ID) continue;

      if (mudanca.field === "messages") {
        for (const msg of valor.messages || []) {
          try { resultados.push(await tratarMensagem(msg, deps)); }
          catch (e) { console.error("mensagem", msg.id, e); }
        }
      } else if (mudanca.field === "smb_message_echoes") {
        for (const eco of valor.message_echoes || []) {
          try { resultados.push(await tratarEcoDaEquipe(eco, deps)); }
          catch (e) { console.error("eco", eco.id, e); }
        }
      }
    }
  }
  return resultados;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== "/webhook") {
      return new Response("Trilhas do Mar · bot do WhatsApp no ar", { status: 200 });
    }

    // Verificação do webhook (feita uma vez, no painel da Meta).
    if (request.method === "GET") {
      const ok =
        url.searchParams.get("hub.mode") === "subscribe" &&
        env.VERIFY_TOKEN &&
        url.searchParams.get("hub.verify_token") === env.VERIFY_TOKEN;
      return ok
        ? new Response(url.searchParams.get("hub.challenge") || "", { status: 200 })
        : new Response("forbidden", { status: 403 });
    }

    if (request.method !== "POST") return new Response("method not allowed", { status: 405 });

    const corpo = await request.text();
    if (!(await assinaturaValida(env.APP_SECRET, corpo, request.headers.get("x-hub-signature-256")))) {
      return new Response("assinatura inválida", { status: 401 });
    }

    let payload;
    try { payload = JSON.parse(corpo); } catch { return new Response("json inválido", { status: 400 }); }

    // Responde 200 na hora (senão a Meta reenvia) e processa em seguida.
    const deps = { api: criarApi(env), kv: env.ESTADO, env };
    ctx.waitUntil(processarWebhook(payload, deps));
    return new Response("ok", { status: 200 });
  },
};

export { assinaturaValida };
