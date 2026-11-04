/* ══════════════════════════════════════════════════════════════════════════
   TRILHAS DO MAR · CONFIGURAÇÃO
   Este é o ÚNICO arquivo que precisa ser editado no dia a dia.
   Trocou o número, o preço ou o link? É aqui. Não mexa no resto.
   ══════════════════════════════════════════════════════════════════════════ */

window.TDM = {

  /* ─── 1. WHATSAPP ────────────────────────────────────────────────────────
     Número COM código do país e DDD, só dígitos. Brasil = 55.
     Ex.: (48) 99999-8888  →  "5548999998888"                                */
  whatsapp: {
    numero: "5548999399996",          // (48) 99939-9996, com o 55 do Brasil na frente
    exibicao: "(48) 99939-9996",      // como aparece escrito na página
    // A mensagem que já vem digitada na conversa sai no idioma que o visitante
    // está lendo. Para mudar o texto, veja "wa.msg" e "wa.geral" em i18n.js.
  },

  /* ─── 2. PREÇOS ──────────────────────────────────────────────────────────
     Valor POR PESSOA, só o número (sem "R$" e sem centavos).
       trajeto    = só uma perna (para quem vai de barco e volta pela trilha)
       idaEVolta  = o passeio completo
     Deixe o passeio como null para a landing mostrar "Consulte pelo WhatsApp".   */
  precos: {
    lagoinhaPantano: { trajeto: 80, idaEVolta: 160 },   // Pântano do Sul → Lagoinha do Leste
    tresIrmas:       { idaEVolta: 100 },                // Ilha das Três Irmãs
    moleques:        { idaEVolta: 200 }                 // Ilhas Moleques do Sul
  },

  /* ─── 3. REDES E PLATAFORMAS ─────────────────────────────────────────── */
  redes: {
    instagram:    "https://www.instagram.com/trilhasdomaroficial/",
    airbnb:       "https://www.airbnb.com.br/",  // ⚠️ TROCAR pela página do serviço
    getyourguide: "https://www.getyourguide.com/" // ⚠️ TROCAR pela página da atividade
  },

  /* ─── 4. NOTA E AVALIAÇÕES ───────────────────────────────────────────── */
  avaliacoes: {
    nota: "4,9",                      // ⚠️ nota média real (Airbnb/GetYourGuide)
    quantidade: ""                   // ⚠️ quantas avaliações somadas
  },

  /* ─── 5. DEPOIMENTOS ─────────────────────────────────────────────────────
     A lista está VAZIA de propósito: enquanto não houver avaliação real, a
     seção de prova social fica oculta no site (nada de review inventada ao ar
     = propaganda enganosa). Para ligar a seção, preencha com as avaliações
     REAIS do Airbnb / GetYourGuide / Google e a seção volta sozinha.

     Campos: nome · nota (1 a 5) · passeio · foto (caminho ou null)
             chave  = texto traduzido, definido em i18n.js ("dep.1" a "dep.5")
             texto  = alternativa à chave, para uma avaliação num idioma só
     Se a pessoa deixou foto, preencha `foto`; sem foto, o card mostra só o nome.

     Template (troque nome/passeio/texto pelos reais e mova pra lista acima):
     { nome: "Nome real",  nota: 5, passeio: "Pântano do Sul → Lagoinha do Leste",
       texto: "Comentário real copiado da avaliação.", foto: null } */
  depoimentos: [],

  /* ─── 5b. GALERIA (página galeria.html) ──────────────────────────────────
     Cada item é uma foto ou um vídeo. Deixe a lista vazia e a página mostra
     um aviso honesto com link para o Instagram, em vez de uma grade quebrada.
       tipo    : "foto" | "video"
       src     : caminho do arquivo (coloque em assets/img/galeria/)
       poster  : só para vídeo, imagem que aparece antes de tocar
       passeio : "lagoinha" | "irmas" | "moleques" | "bordo"  (vira filtro)
       formato : "alto" ocupa 2 linhas · "largo" ocupa 2 colunas · vazio = normal
       legenda : texto curto que aparece ao passar o mouse
     Exemplo:
       { tipo:"foto",  src:"assets/img/galeria/01.jpg", passeio:"lagoinha", formato:"alto",
         alt:"Barco chegando na Lagoinha do Leste", legenda:"Chegada na Lagoinha" },
       { tipo:"video", src:"assets/img/galeria/01.mp4", poster:"assets/img/galeria/01.jpg",
         passeio:"moleques", legenda:"Navegando até as Moleques" },                        */
  galeria: [
    { tipo:"foto", src:"assets/img/equipe-pano.jpg", passeio:"bordo", formato:"largo",
      alt:"A equipe do Trilhas do Mar na praia, ao lado dos dois botes",
      legenda:"A equipe e os botes, no Pântano do Sul" },
    { tipo:"foto", src:"assets/img/galeria/dupla-lagoinha.jpg", passeio:"lagoinha", formato:"alto",
      alt:"Cachorro do bote e uma passageira olhando a praia da Lagoinha do Leste chegando",
      legenda:"Chegando na Lagoinha, do jeito que ela aparece" },
    { tipo:"video", src:"assets/img/galeria/fauna-costao.mp4", poster:"assets/img/galeria/fauna-costao.jpg",
      passeio:"moleques",
      alt:"Vida selvagem no costão das ilhas durante a navegação",
      legenda:"Fauna no costão das ilhas" },
    { tipo:"video", src:"assets/img/galeria/barco-trilhas.mp4", poster:"assets/img/galeria/barco-trilhas.jpg",
      passeio:"bordo",
      alt:"O barco do Trilhas do Mar com passageiros, parada de banho e snorkel",
      legenda:"O barco, a parada de banho e o snorkel" },
    { tipo:"video", src:"assets/img/galeria/lobos-marinhos.mp4", poster:"assets/img/galeria/lobos-marinhos.jpg",
      passeio:"moleques", formato:"alto",
      alt:"Grupo de lobos-marinhos descansando nos rochedos das ilhas",
      legenda:"Lobos-marinhos nos rochedos" },
    { tipo:"video", src:"assets/img/galeria/portal-rochedos.mp4", poster:"assets/img/galeria/portal-rochedos.jpg",
      passeio:"moleques",
      alt:"Passagem estreita entre dois rochedos durante a navegação",
      legenda:"A passagem entre os rochedos" },
    { tipo:"foto", src:"assets/img/galeria/costao-verde.jpg", passeio:"bordo",
      alt:"Cachorro do bote olhando o costão verde durante a travessia",
      legenda:"De frente pro costão, na travessia" },
    { tipo:"foto", src:"assets/img/galeria/enseada-chegada.jpg", passeio:"bordo", formato:"alto",
      alt:"Proa do bote chegando na enseada do costão com cachoeira",
      legenda:"Chegando na enseada" },
    { tipo:"foto", src:"assets/img/galeria/enseada-cachoeira.jpg", passeio:"bordo",
      alt:"Enseada do costão com pedras e cachoeira ao fundo",
      legenda:"A enseada, pedras e cachoeira" }
  ],

  /* ─── 6. FOTOS ───────────────────────────────────────────────────────────
     Coloque os arquivos em assets/img/ e aponte o caminho aqui.
     Deixe null para exibir o placeholder desenhado (não quebra o layout).
     Tamanhos recomendados em assets/img/LEIA-ME.md                          */
  fotos: {
    hero:       "assets/img/hero-lagoinha-costao.jpg",  // foto da cooperativa (a antiga do Wikimedia ficou em hero-lagoinha.jpg)
    lagoinha:   "assets/img/hero-lagoinha-costao.jpg",  // costão e mar verde da Lagoinha
    moleques:   "assets/img/moleques.jpg",    // vista aérea do arquipélago
    tresirmas:  "assets/img/tres-irmas.jpg",  // as três ilhas vistas do alto
    barqueiro:  "assets/img/equipe.jpg"   // a equipe da cooperativa na praia
  }
};
