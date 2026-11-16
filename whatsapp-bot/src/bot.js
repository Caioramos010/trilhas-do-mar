// A conversa do bot. Não sabe nada de HTTP: recebe a mensagem já lida do
// webhook, o KV (estado) e a API (para responder).
import { NEGOCIO, PASSEIOS, TEXTOS, PALAVRAS_MENU } from "./conteudo.js";

const MINUTO = 60;
const HORA = 60 * MINUTO;

// Quanto tempo o bot fica quieto depois que a conversa foi para a equipe.
function ttlEquipe(env) {
  const horas = Number(env.HANDOFF_HORAS) || 8;
  return Math.max(60, Math.round(horas * HORA));
}
// Se o cliente escrever de novo até esse tempo depois do menu, é dúvida:
// vai para a equipe em vez de receber o menu outra vez.
const JANELA_MENU = 30 * MINUTO;

const chave = {
  equipe: (wa) => `equipe:${wa}`,
  menu: (wa) => `menu:${wa}`,
  visto: (id) => `visto:${id}`,
  mar: "painel:mar",
  leads: "painel:leads",
};

function normalizar(texto) {
  return (texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const MENU_NORMALIZADO = new Set(PALAVRAS_MENU.map(normalizar));

export function ehPedidoDeMenu(texto) {
  return MENU_NORMALIZADO.has(normalizar(texto));
}

export function detectarPasseioDoSite(texto) {
  const t = normalizar(texto);
  if (!t) return null;
  if (t.includes("moleques")) {
    return PASSEIOS.find((p) => p.id === (t.includes("guia") ? "molequesguia" : "moleques")) || null;
  }
  if (t.includes("tres irmas") || t.includes("sul da ilha") || t.includes("panoramico")) {
    return PASSEIOS.find((p) => p.id === "tresirmas") || null;
  }
  if (t.includes("lagoinha")) {
    return PASSEIOS.find((p) => p.id === "lagoinha") || null;
  }
  return null;
}

export function respostaInterativa(msg) {
  if (msg.type !== "interactive" || !msg.interactive) return null;
  return msg.interactive.list_reply?.id || msg.interactive.button_reply?.id || null;
}

async function lerMar(kv) {
  try {
    const raw = await kv.get(chave.mar);
    if (!raw) return { status: "aberto", nota: "" };
    if (raw.startsWith("{")) return JSON.parse(raw);
    return { status: raw, nota: "" };
  } catch {
    return { status: "aberto", nota: "" };
  }
}

async function registrarLead(kv, wa, status, passeio, resumo) {
  try {
    const raw = await kv.get(chave.leads);
    const lista = raw ? JSON.parse(raw) : [];
    const agora = new Date().toISOString();
    const sem = Array.isArray(lista) ? lista.filter((x) => x.wa !== wa) : [];
    sem.unshift({
      wa,
      status,
      passeio: passeio || "Geral",
      resumo: String(resumo || "").slice(0, 90),
      atualizadoEm: agora,
    });
    await kv.put(chave.leads, JSON.stringify(sem.slice(0, 25)));
  } catch {
    // Registro no painel nunca interrompe atendimento no WhatsApp.
  }
}

async function enviarAvisoMarSeFechado(api, kv, para) {
  const mar = await lerMar(kv);
  if (mar.status !== "fechado") return;
  const extra = mar.nota ? ` (${mar.nota})` : "";
  await api.texto(
    para,
    `Aviso de hoje: as saídas estão suspensas por condição do mar${extra}. Você pode deixar sua data de preferência aqui para avisarmos quando abrir.`,
  );
}

async function enviarMenu(api, kv, para) {
  await api.lista(para, TEXTOS.boasVindas, TEXTOS.botaoLista, [
    {
      titulo: TEXTOS.secaoPasseios,
      linhas: PASSEIOS.map((p) => ({ id: `p:${p.id}`, titulo: p.titulo, resumo: p.resumo })),
    },
    {
      titulo: TEXTOS.secaoAtendimento,
      linhas: [
        { id: "embarque", titulo: TEXTOS.opcaoEmbarque.titulo, resumo: TEXTOS.opcaoEmbarque.resumo },
        { id: "equipe", titulo: TEXTOS.opcaoEquipe.titulo, resumo: TEXTOS.opcaoEquipe.resumo },
      ],
    },
  ]);
  await kv.put(chave.menu(para), "1", { expirationTtl: JANELA_MENU });
}

async function passarParaEquipe(api, kv, env, para, texto) {
  await kv.put(chave.equipe(para), String(Date.now()), { expirationTtl: ttlEquipe(env) });
  await kv.delete(chave.menu(para));
  if (texto) await api.texto(para, texto);
}

async function mostrarPasseio(api, kv, para, passeio) {
  await api.imagem(para, passeio.foto, passeio.texto);
  await api.botoes(para, TEXTOS.depoisDoPasseio, [
    { id: `r:${passeio.id}`, titulo: TEXTOS.botaoReservar },
    { id: "menu", titulo: TEXTOS.botaoOutros },
  ]);
  await kv.put(chave.menu(para), "1", { expirationTtl: JANELA_MENU });
}

// Mensagem que o CLIENTE mandou.
export async function tratarMensagem(msg, { api, kv, env }) {
  const para = msg.from;
  if (!para || !msg.id) return "ignorada";

  // A Meta reenvia o webhook se demorar; não responda duas vezes.
  if (await kv.get(chave.visto(msg.id))) return "repetida";
  await kv.put(chave.visto(msg.id), "1", { expirationTtl: 2 * 24 * HORA });

  await api.marcarLida(msg.id);

  const escolha = respostaInterativa(msg);
  const comEquipe = Boolean(await kv.get(chave.equipe(para)));
  const textoMsg = msg.text?.body || "";

  if (escolha) {
    if (escolha === "menu") {
      await kv.delete(chave.equipe(para));
      await enviarMenu(api, kv, para);
      await registrarLead(kv, para, "menu", "Menu geral", "Reabriu menu");
      return "menu";
    }
    if (escolha === "embarque") {
      await api.texto(para, TEXTOS.embarque.replace("{mapa}", NEGOCIO.mapa));
      await registrarLead(kv, para, "embarque", "Ponto de saída", "Consultou localização");
      return "embarque";
    }
    if (escolha === "equipe") {
      await passarParaEquipe(api, kv, env, para, TEXTOS.passarEquipe);
      await registrarLead(kv, para, "duvida_equipe", "Atendimento", "Pediu falar com equipe");
      return "equipe";
    }
    const [tipo, id] = escolha.split(":");
    const passeio = PASSEIOS.find((p) => p.id === id);
    if (passeio && tipo === "p") {
      await kv.delete(chave.equipe(para));
      await mostrarPasseio(api, kv, para, passeio);
      await registrarLead(kv, para, "escolheu_passeio", passeio.titulo, "Abriu ficha do passeio");
      return "passeio";
    }
    if (passeio && tipo === "r") {
      await passarParaEquipe(api, kv, env, para, `*${passeio.titulo}* ✅\n\n${TEXTOS.pedirReserva}`);
      await registrarLead(kv, para, "reserva_aguardando_equipe", passeio.titulo, "Clicou em Quero reservar");
      return "reserva";
    }
    // Botão de uma versão antiga do menu: mostra o menu atual.
    await enviarMenu(api, kv, para);
    return "menu";
  }

  if (msg.type === "text" && ehPedidoDeMenu(textoMsg)) {
    await kv.delete(chave.equipe(para));
    await enviarMenu(api, kv, para);
    await registrarLead(kv, para, "menu", "Menu geral", textoMsg);
    return "menu";
  }

  if (comEquipe) {
    // A equipe está cuidando: o bot não fala nada. Mantém o silêncio vivo
    // enquanto a conversa continua.
    await kv.put(chave.equipe(para), String(Date.now()), { expirationTtl: ttlEquipe(env) });
    await registrarLead(kv, para, "equipe_atendendo", null, textoMsg || "Mensagem do cliente");
    return "silencio";
  }

  if (await kv.get(chave.menu(para))) {
    // Já recebeu o menu ou ficha há pouco e escreveu: é dúvida para a equipe.
    await passarParaEquipe(api, kv, env, para, TEXTOS.passarEquipe);
    await registrarLead(kv, para, "duvida_equipe", null, textoMsg || "Dúvida pós-menu");
    return "equipe";
  }

  await enviarAvisoMarSeFechado(api, kv, para);

  const passeioSite = msg.type === "text" ? detectarPasseioDoSite(textoMsg) : null;
  if (passeioSite) {
    await mostrarPasseio(api, kv, para, passeioSite);
    await registrarLead(kv, para, "escolheu_passeio", passeioSite.titulo, textoMsg);
    return "passeio";
  }

  await enviarMenu(api, kv, para);
  await registrarLead(kv, para, "menu", "Primeiro contato", textoMsg || "Oi");
  return "menu";
}

// Mensagem que a EQUIPE mandou pelo app do WhatsApp Business (coexistência).
// O bot sai da conversa para não atropelar o atendimento.
export async function tratarEcoDaEquipe(eco, { kv, env }) {
  const cliente = eco.to;
  if (!cliente) return "ignorada";
  await kv.put(chave.equipe(cliente), String(Date.now()), { expirationTtl: ttlEquipe(env) });
  await kv.delete(chave.menu(cliente));
  await registrarLead(kv, cliente, "equipe_atendendo", null, eco.text?.body || "Equipe respondeu no app");
  return "equipe-assumiu";
}
