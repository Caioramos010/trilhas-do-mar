# Bot do WhatsApp · Trilhas do Mar

Cloudflare Worker (plano grátis) que recebe as mensagens do WhatsApp do Trilhas do Mar
pela Cloud API da Meta e responde sozinho com o menu de passeios. A equipe continua
atendendo pelo **app WhatsApp Business no celular**, no mesmo número (modo coexistência).

## Como a conversa funciona

1. Cliente manda qualquer coisa → recebe boas-vindas + lista **Ver opções**
   (4 passeios, onde é o embarque, falar com a equipe).
2. Toca num passeio → recebe foto + preço + horários e os botões
   **Quero reservar** / **Ver outros passeios**.
3. **Quero reservar** → o bot pede data, número de pessoas e horário, e **sai da conversa**.
   A equipe confirma pelo app.
4. Escreveu de novo logo depois do menu (é dúvida) ou tocou em **Falar com a equipe** → vai pra equipe.
5. **Alguém da equipe respondeu pelo app** → o bot fica quieto naquela conversa por 8 h
   (muda em `HANDOFF_HORAS`).
6. O cliente pode mandar **menu** a qualquer momento pra ver as opções de novo.

Textos, preços e fotos: `src/conteudo.js`. Mudou lá e deu push, o Cloudflare publica sozinho.

## Custos

- Cloudflare Workers + KV: plano grátis (100 mil requisições/dia).
- WhatsApp: responder quem chamou primeiro, dentro de 24 h, não é cobrado pela Meta.
  Só mensagens que a empresa inicia (template/marketing) são cobradas. O bot nunca inicia conversa.

## Configuração

### 1. Cloudflare

1. **Storage & Databases → KV → Create** com o nome `trilhas-whatsapp-estado`. Copie o **ID**
   e coloque em `wrangler.toml`, no lugar de `COLE_AQUI_O_ID_DO_KV`.
2. **Workers & Pages → Create application → Connect GitHub** → repositório `trilhas-do-mar`.
   - Project name: `trilhas-do-mar-whatsapp`
   - **Root directory: `whatsapp-bot`**
   - Deploy command: `npx wrangler deploy`
3. No Worker criado: **Settings → Variables and Secrets → Add**, tipo **Secret**:
   `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `APP_SECRET`, `VERIFY_TOKEN`.
4. A URL do webhook fica `https://trilhas-do-mar-whatsapp.<sua-conta>.workers.dev/webhook`.
   Abrir a raiz no navegador mostra "bot do WhatsApp no ar".

### 2. Meta (usando o app da Ilha Conecta, que já é Tech Provider)

A Meta não deixa a mesma empresa que é dona do app ligar o próprio número em coexistência.
Por isso o número do Trilhas do Mar entra pelo app da Ilha Conecta, como cliente,
pelo Embedded Signup na opção **WhatsApp Business App Onboarding** (coexistência).

1. No celular do Trilhas do Mar: **WhatsApp Business** atualizado, com o número em uso há algum tempo.
2. Rodar o Embedded Signup da Ilha com a empresa do Trilhas do Mar, escolher
   **conectar o app WhatsApp Business existente** e ler o QR code no celular deles.
3. Guardar o **WABA ID** e o **PHONE_NUMBER_ID** que aparecem no fim.
4. Apontar os webhooks **só desse WABA** para o Worker, sem mexer nos outros clientes da Ilha:

   ```bash
   curl -X POST "https://graph.facebook.com/v23.0/<WABA_ID>/subscribed_apps" \
     -H "Authorization: Bearer <TOKEN>" \
     -d "override_callback_uri=https://trilhas-do-mar-whatsapp.<sua-conta>.workers.dev/webhook" \
     -d "verify_token=<VERIFY_TOKEN>"
   ```

5. No app da Meta, em **WhatsApp → Configuration → Webhook fields**, deixar assinados
   `messages` e `smb_message_echoes` (é por esse que o bot sabe que a equipe respondeu pelo app).
6. `APP_SECRET`: **App settings → Basic → App secret** do app da Ilha.
   `WHATSAPP_TOKEN`: token permanente de um usuário do sistema com acesso ao WABA do Trilhas.

### 3. Testar

Mande "oi" de outro celular para o número do Trilhas do Mar. Deve chegar o menu.
Erros aparecem em **Workers → trilhas-do-mar-whatsapp → Logs**.

## Rodar os testes

```bash
cd whatsapp-bot
npm install
npm test
```
