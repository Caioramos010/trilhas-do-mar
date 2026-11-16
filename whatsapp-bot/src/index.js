// Cloudflare Worker: webhook da WhatsApp Cloud API + ponte do Painel Trilhas do Mar.
import { criarApi } from "./whatsapp.js";
import { tratarMensagem, tratarEcoDaEquipe } from "./bot.js";

const enc = new TextEncoder();

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-trilhas-pin, x-trilhas-email",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...CORS,
    },
  });
}

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

function autenticarPainel(request, env) {
  const pin = String(env.PAINEL_PIN || "").trim();
  if (!pin) return true;
  return String(request.headers.get("x-trilhas-pin") || "").trim() === pin;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/painel-whatsapp") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (!autenticarPainel(request, env)) return json({ ok: false, erro: "PIN do painel inválido" }, 401);

      if (request.method === "GET") {
        const marRaw = env.ESTADO ? await env.ESTADO.get("painel:mar") : null;
        const leadsRaw = env.ESTADO ? await env.ESTADO.get("painel:leads") : null;
        let mar = { status: "aberto", nota: "" };
        try { if (marRaw) mar = marRaw.startsWith("{") ? JSON.parse(marRaw) : { status: marRaw, nota: "" }; } catch {}
        let leads = [];
        try { if (leadsRaw) leads = JSON.parse(leadsRaw); } catch {}
        return json({
          ok: true,
          whatsappOficial: Boolean(env.PHONE_NUMBER_ID && env.WHATSAPP_TOKEN),
          handoffHoras: Number(env.HANDOFF_HORAS) || 8,
          mar,
          leads: Array.isArray(leads) ? leads : [],
        });
      }

      if (request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ ok: false, erro: "JSON inválido" }, 400); }
        const status = ["aberto", "consulta", "fechado"].includes(body.marStatus) ? body.marStatus : "aberto";
        const nota = String(body.marNota || "").slice(0, 120);
        const salvo = { status, nota, atualizadoEm: new Date().toISOString() };
        if (env.ESTADO) await env.ESTADO.put("painel:mar", JSON.stringify(salvo));
        return json({ ok: true, mar: salvo });
      }

      return json({ ok: false, erro: "Método não permitido" }, 405);
    }

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
