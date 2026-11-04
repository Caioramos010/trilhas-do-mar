/* ══════════════════════════════════════════════════════════════════════════
   TRILHAS DO MAR · O QUE O BOT RESPONDE
   Trocou preço, horário ou texto? É só aqui. Depois é só dar push.
   Limites do WhatsApp: título da lista ≤ 24 letras, descrição ≤ 72,
   texto de botão ≤ 20.
   ══════════════════════════════════════════════════════════════════════════ */

const SITE = "https://trilhasdomar.com";

export const NEGOCIO = {
  nome: "Trilhas do Mar",
  site: SITE,
  instagram: "@trilhasdomaroficial",
  // Link do mapa enviado em "Onde é o embarque". Se quiser o ponto exato,
  // abra o Google Maps, marque o lugar, toque em Compartilhar e cole o link aqui.
  mapa: "https://maps.google.com/?q=Praia+do+P%C3%A2ntano+do+Sul,+Florian%C3%B3polis",
};

export const PASSEIOS = [
  {
    id: "lagoinha",
    titulo: "Lagoinha do Leste",
    resumo: "Travessia de ~25 min · R$ 80 ida / R$ 150 ida e volta",
    foto: `${SITE}/assets/img/hero-lagoinha-costao.jpg`,
    texto: [
      "*Lagoinha do Leste* 🏝️",
      "Travessia de cerca de 25 min do Pântano do Sul até uma das praias mais bonitas da Ilha.",
      "",
      "🕘 Das 9h às 16h, barco vai e volta a cada 40 min",
      "💰 R$ 80 só ida · R$ 150 ida e volta (por pessoa)",
      "📍 Saída: Praia do Pântano do Sul",
    ].join("\n"),
  },
  {
    id: "tresirmas",
    titulo: "Ilha das Três Irmãs",
    resumo: "2h de passeio com snorkel · R$ 100 por pessoa",
    foto: `${SITE}/assets/img/tres-irmas.jpg`,
    texto: [
      "*Ilha das Três Irmãs* 🚤",
      "2 horas navegando entre formações rochosas e paisagens exuberantes.",
      "",
      "🕘 Horário flexível",
      "💰 R$ 100 por pessoa",
      "🤿 Equipamento de snorkel incluso",
      "📍 Saída: Praia do Pântano do Sul",
    ].join("\n"),
  },
  {
    id: "moleques",
    titulo: "Moleques do Sul",
    resumo: "Arquipélago e águas cristalinas · R$ 200 por pessoa",
    foto: `${SITE}/assets/img/moleques.jpg`,
    texto: [
      "*Arquipélago dos Moleques do Sul* 🌊",
      "Um passeio pelas belezas naturais da Ilha dos Moleques do Sul e suas águas cristalinas.",
      "",
      "🕘 Saídas: 8h30 às 12h30 ou 13h30 às 17h30",
      "💰 R$ 200 por pessoa",
      "🤿 Equipamento de snorkel incluso",
      "📍 Saída: Praia do Pântano do Sul",
    ].join("\n"),
  },
  {
    id: "molequesguia",
    titulo: "Moleques com guia",
    resumo: "O mesmo roteiro com guia a bordo · R$ 330 por pessoa",
    foto: `${SITE}/assets/img/moleques-costao.jpg`,
    texto: [
      "*Moleques do Sul com guia* 🧭",
      "O passeio às Moleques do Sul acompanhado por guia, com mais histórias e curiosidades da região.",
      "",
      "🕘 Saídas: 8h30 às 12h30 ou 13h30 às 17h30",
      "💰 R$ 330 por pessoa",
      "🤿 Equipamento de snorkel incluso",
      "📍 Saída: Praia do Pântano do Sul",
    ].join("\n"),
  },
];

export const TEXTOS = {
  boasVindas:
    "Oi! Aqui é o *Trilhas do Mar* 🚤\n" +
    "Passeios de barco saindo da Praia do Pântano do Sul, com os barqueiros da comunidade.\n\n" +
    "Toca em *Ver opções* pra conhecer os passeios, ver preços e horários.",
  botaoLista: "Ver opções",
  secaoPasseios: "Passeios",
  secaoAtendimento: "Atendimento",
  opcaoEmbarque: { titulo: "Onde é o embarque", resumo: "Localização na Praia do Pântano do Sul" },
  opcaoEquipe: { titulo: "Falar com a equipe", resumo: "Dúvidas, grupos, datas especiais" },

  depoisDoPasseio: "Quer reservar esse passeio?",
  botaoReservar: "Quero reservar",
  botaoOutros: "Ver outros passeios",

  pedirReserva:
    "Perfeito! Manda aqui:\n" +
    "• a *data* que você quer ir\n" +
    "• *quantas pessoas*\n" +
    "• o *horário* (quando o passeio tiver mais de um)\n\n" +
    "Um barqueiro da equipe confirma a vaga por aqui. 🙌",

  passarEquipe:
    "Já te passo pra equipe! Pode mandar sua dúvida por aqui. 🙌\n" +
    "Se a gente estiver no mar, pode levar um pouquinho pra responder.",

  embarque:
    "📍 O embarque é na *Praia do Pântano do Sul*, em Florianópolis.\n" +
    "Chegue uns 15 minutos antes do horário. Saídas sujeitas às condições do mar e do tempo.\n\n" +
    "Mapa: {mapa}",

  aindaComEquipe:
    "A equipe já foi avisada e responde por aqui. Se quiser ver os passeios de novo, manda *menu*.",
};

// Palavras que o cliente pode mandar a qualquer momento para ver o menu de novo.
export const PALAVRAS_MENU = ["menu", "opcoes", "opções", "inicio", "início", "passeios", "voltar"];
