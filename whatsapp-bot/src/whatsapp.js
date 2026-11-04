// Cliente mínimo da WhatsApp Cloud API (Graph API da Meta).

export function criarApi(env, fetchFn = fetch) {
  const versao = env.GRAPH_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${versao}/${env.PHONE_NUMBER_ID}/messages`;

  async function enviar(corpo) {
    const resp = await fetchFn(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...corpo }),
    });
    if (!resp.ok) {
      const detalhe = await resp.text().catch(() => "");
      console.error("WhatsApp API", resp.status, detalhe.slice(0, 500));
    }
    return resp.ok;
  }

  return {
    texto: (para, body) =>
      enviar({ to: para, type: "text", text: { body, preview_url: true } }),

    imagem: (para, link, caption) =>
      enviar({ to: para, type: "image", image: { link, caption } }),

    lista: (para, body, botao, secoes) =>
      enviar({
        to: para,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: body },
          action: {
            button: botao,
            sections: secoes.map((s) => ({
              title: s.titulo,
              rows: s.linhas.map((l) => ({ id: l.id, title: l.titulo, description: l.resumo })),
            })),
          },
        },
      }),

    botoes: (para, body, botoes) =>
      enviar({
        to: para,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: body },
          action: {
            buttons: botoes.map((b) => ({ type: "reply", reply: { id: b.id, title: b.titulo } })),
          },
        },
      }),

    marcarLida: (mensagemId) =>
      enviar({ status: "read", message_id: mensagemId }),
  };
}
