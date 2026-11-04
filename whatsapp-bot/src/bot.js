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
};

function normalizar(texto) {
  return (texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}
const MENU_NORMALIZADO = new Set(PALAVRAS_MENU.map(normalizar));

export function ehPedidoDeMenu(texto) {
  return MENU_NORMALIZADO.has(normalizar(texto));
}

export function respostaInterativa(msg) {
  if (msg.type !== "interactive" || !msg.interactive) return null;
  return msg.interactive.list_reply?.id || msg.interactive.button_reply?.id || null;
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

async function mostrarPasseio(api, para, passeio) {
  await api.imagem(para, passeio.foto, passeio.texto);
  await api.botoes(para, TEXTOS.depoisDoPasseio, [
    { id: `r:${passeio.id}`, titulo: TEXTOS.botaoReservar },
    { id: "menu", titulo: TEXTOS.botaoOutros },
  ]);
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

  if (escolha) {
    if (escolha === "menu") {
      await kv.delete(chave.equipe(para));
      await enviarMenu(api, kv, para);
      return "menu";
    }
    if (escolha === "embarque") {
      await api.texto(para, TEXTOS.embarque.replace("{mapa}", NEGOCIO.mapa));
      return "embarque";
    }
    if (escolha === "equipe") {
      await passarParaEquipe(api, kv, env, para, TEXTOS.passarEquipe);
      return "equipe";
    }
    const [tipo, id] = escolha.split(":");
    const passeio = PASSEIOS.find((p) => p.id === id);
    if (passeio && tipo === "p") {
      await kv.delete(chave.equipe(para));
      await mostrarPasseio(api, para, passeio);
      return "passeio";
    }
    if (passeio && tipo === "r") {
      await passarParaEquipe(api, kv, env, para, `*${passeio.titulo}* ✅\n\n${TEXTOS.pedirReserva}`);
      return "reserva";
    }
    // Botão de uma versão antiga do menu: mostra o menu atual.
    await enviarMenu(api, kv, para);
    return "menu";
  }

  if (msg.type === "text" && ehPedidoDeMenu(msg.text?.body)) {
    await kv.delete(chave.equipe(para));
    await enviarMenu(api, kv, para);
    return "menu";
  }

  if (comEquipe) {
    // A equipe está cuidando: o bot não fala nada. Mantém o silêncio vivo
    // enquanto a conversa continua.
    await kv.put(chave.equipe(para), String(Date.now()), { expirationTtl: ttlEquipe(env) });
    return "silencio";
  }

  if (await kv.get(chave.menu(para))) {
    // Já recebeu o menu há pouco e escreveu: é dúvida para a equipe.
    await passarParaEquipe(api, kv, env, para, TEXTOS.passarEquipe);
    return "equipe";
  }

  await enviarMenu(api, kv, para);
  return "menu";
}

// Mensagem que a EQUIPE mandou pelo app do WhatsApp Business (coexistência).
// O bot sai da conversa para não atropelar o atendimento.
export async function tratarEcoDaEquipe(eco, { kv, env }) {
  const cliente = eco.to;
  if (!cliente) return "ignorada";
  await kv.put(chave.equipe(cliente), String(Date.now()), { expirationTtl: ttlEquipe(env) });
  await kv.delete(chave.menu(cliente));
  return "equipe-assumiu";
}
