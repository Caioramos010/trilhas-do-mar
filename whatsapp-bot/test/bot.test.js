import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker, { processarWebhook, assinaturaValida } from "../src/index.js";
import { criarApi } from "../src/whatsapp.js";
import { PASSEIOS } from "../src/conteudo.js";

const CLIENTE = "5548988887777";
const ENV = { PHONE_NUMBER_ID: "123", WHATSAPP_TOKEN: "t", APP_SECRET: "s3gr3do", VERIFY_TOKEN: "v", HANDOFF_HORAS: "8" };

function kvFalso() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
  };
}

function apiFalsa() {
  const enviados = [];
  const fetchFalso = async (url, init) => {
    enviados.push(JSON.parse(init.body));
    return new Response("{}", { status: 200 });
  };
  return { api: criarApi(ENV, fetchFalso), enviados, semLeitura: () => enviados.filter((e) => e.status !== "read") };
}

let n = 0;
const texto = (body) => ({ from: CLIENTE, id: `m${++n}`, type: "text", text: { body } });
const clique = (id) => ({ from: CLIENTE, id: `m${++n}`, type: "interactive", interactive: { type: "list_reply", list_reply: { id, title: "x" } } });
const botao = (id) => ({ from: CLIENTE, id: `m${++n}`, type: "interactive", interactive: { type: "button_reply", button_reply: { id, title: "x" } } });
const payloadMsgs = (...msgs) => ({ entry: [{ changes: [{ field: "messages", value: { metadata: { phone_number_id: "123" }, messages: msgs } }] }] });
const payloadEco = (to) => ({ entry: [{ changes: [{ field: "smb_message_echoes", value: { metadata: { phone_number_id: "123" }, message_echoes: [{ from: "554899399996", to, id: `e${++n}`, type: "text", text: { body: "oi, é o barqueiro" } }] } }] }] });

function setup() {
  const kv = kvFalso();
  const a = apiFalsa();
  return { kv, ...a, deps: { api: a.api, kv, env: ENV } };
}

test("primeira mensagem recebe o menu com os 4 passeios e as opções de atendimento", async () => {
  const s = setup();
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("oi, quanto custa?")), s.deps), ["menu"]);
  const [lista] = s.semLeitura();
  assert.equal(lista.interactive.type, "list");
  const ids = lista.interactive.action.sections.flatMap((sec) => sec.rows.map((r) => r.id));
  assert.deepEqual(ids, ["p:lagoinha", "p:tresirmas", "p:moleques", "p:molequesguia", "embarque", "equipe"]);
  assert.ok(s.enviados.some((e) => e.status === "read"), "marca como lida");
});

test("limites do WhatsApp: títulos ≤24, descrições ≤72, botões ≤20", async () => {
  for (const p of PASSEIOS) {
    assert.ok(p.titulo.length <= 24, p.titulo);
    assert.ok(p.resumo.length <= 72, p.resumo);
    assert.ok(p.texto.length <= 1024, `legenda de ${p.id}`);
  }
  const s = setup();
  await processarWebhook(payloadMsgs(clique("p:lagoinha")), s.deps);
  const botoes = s.semLeitura()[1].interactive.action.buttons;
  for (const b of botoes) assert.ok(b.reply.title.length <= 20, b.reply.title);
});

test("escolher um passeio manda foto com legenda e os botões de reservar", async () => {
  const s = setup();
  assert.deepEqual(await processarWebhook(payloadMsgs(clique("p:moleques")), s.deps), ["passeio"]);
  const [img, btn] = s.semLeitura();
  assert.equal(img.type, "image");
  assert.match(img.image.caption, /R\$ 200/);
  assert.equal(btn.interactive.action.buttons[0].reply.id, "r:moleques");
});

test("reservar passa para a equipe e o bot fica quieto depois", async () => {
  const s = setup();
  await processarWebhook(payloadMsgs(botao("r:tresirmas")), s.deps);
  assert.match(s.semLeitura()[0].text.body, /Ilha das Três Irmãs/);
  const antes = s.semLeitura().length;
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("dia 12, 4 pessoas")), s.deps), ["silencio"]);
  assert.equal(s.semLeitura().length, antes, "não responde enquanto está com a equipe");
});

test("escrever de novo logo depois do menu é dúvida: vai para a equipe", async () => {
  const s = setup();
  await processarWebhook(payloadMsgs(texto("oi")), s.deps);
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("tem desconto pra criança?")), s.deps), ["equipe"]);
  assert.match(s.semLeitura().at(-1).text.body, /equipe/);
});

test("quando a equipe responde pelo app, o bot sai da conversa", async () => {
  const s = setup();
  assert.deepEqual(await processarWebhook(payloadEco(CLIENTE), s.deps), ["equipe-assumiu"]);
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("beleza, obrigado")), s.deps), ["silencio"]);
  assert.equal(s.semLeitura().length, 0);
});

test("'menu' traz o bot de volta mesmo com a equipe", async () => {
  const s = setup();
  await processarWebhook(payloadEco(CLIENTE), s.deps);
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("Menu")), s.deps), ["menu"]);
  assert.deepEqual(await processarWebhook(payloadMsgs(texto("Opções!")), s.deps), ["menu"]);
});

test("mensagem repetida pela Meta não gera resposta dupla", async () => {
  const s = setup();
  const msg = texto("oi");
  await processarWebhook(payloadMsgs(msg), s.deps);
  assert.deepEqual(await processarWebhook(payloadMsgs(msg), s.deps), ["repetida"]);
  assert.equal(s.semLeitura().length, 1);
});

test("embarque manda o texto com o link do mapa", async () => {
  const s = setup();
  await processarWebhook(payloadMsgs(clique("embarque")), s.deps);
  assert.match(s.semLeitura()[0].text.body, /maps\.google\.com/);
});

test("ignora eventos de outro número", async () => {
  const s = setup();
  const p = payloadMsgs(texto("oi"));
  p.entry[0].changes[0].value.metadata.phone_number_id = "999";
  assert.deepEqual(await processarWebhook(p, s.deps), []);
});

test("worker: verificação do webhook e assinatura", async () => {
  const ok = await worker.fetch(new Request("https://x/webhook?hub.mode=subscribe&hub.verify_token=v&hub.challenge=42"), ENV, {});
  assert.equal(await ok.text(), "42");
  const ruim = await worker.fetch(new Request("https://x/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=42"), ENV, {});
  assert.equal(ruim.status, 403);

  const corpo = JSON.stringify(payloadMsgs(texto("oi")));
  const sig = "sha256=" + createHmac("sha256", ENV.APP_SECRET).update(corpo).digest("hex");
  assert.equal(await assinaturaValida(ENV.APP_SECRET, corpo, sig), true);
  assert.equal(await assinaturaValida(ENV.APP_SECRET, corpo + " ", sig), false);

  const falsa = await worker.fetch(new Request("https://x/webhook", { method: "POST", body: corpo, headers: { "x-hub-signature-256": "sha256=00" } }), ENV, {});
  assert.equal(falsa.status, 401);

  let esperado;
  const env = { ...ENV, ESTADO: kvFalso() };
  const resp = await worker.fetch(new Request("https://x/webhook", { method: "POST", body: corpo, headers: { "x-hub-signature-256": sig } }), env, { waitUntil: (p) => { esperado = p; } });
  assert.equal(resp.status, 200);
  assert.ok(esperado, "processa em segundo plano");
  await esperado.catch(() => {});
});
