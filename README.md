# Trilhas do Mar · landing page

Landing de conversão da cooperativa de barqueiros do sul da Ilha de Florianópolis.
Objetivo único da página: **levar o visitante ao WhatsApp para agendar o passeio**.

HTML, CSS e JavaScript puros. **Não tem build, não tem npm, não tem dependência.**
Abriu o arquivo, funciona.

---

## Como abrir

```bash
cd ~/Projects/trilhas-do-mar
python3 -m http.server 8080
# depois abra http://localhost:8080
```

(Abrir o `index.html` com dois cliques também funciona.)

---

## Os dois arquivos de edição

| Arquivo | O que fica nele |
|---|---|
| `assets/js/config.js` | números e links: WhatsApp, preços, redes sociais, nota média, depoimentos, fotos |
| `assets/js/i18n.js` | **todo o texto da página**, nos três idiomas |

## Três idiomas

A página fala **português, inglês e espanhol**. Na primeira visita ela escolhe pelo idioma do
navegador (português para pt, espanhol para es, inglês para o resto), e a escolha do visitante
fica guardada para as próximas. Trocar de idioma não recarrega a página: o `<html lang>`, o
título, a descrição, os textos, os preços, o painel do mapa e até **a mensagem que já vem
digitada no WhatsApp** mudam na hora.

Para corrigir qualquer texto, edite `assets/js/i18n.js`. Cada frase tem uma chave (`hero.t1`,
`faq.a4`…) repetida nos três idiomas; o HTML aponta para a chave com `data-i18n`.

Duas decisões que valem saber:

- **Nomes de lugar ficam em português nos três idiomas** (Pântano do Sul, Lagoinha do Leste,
  Três Irmãs, Moleques do Sul). É como o visitante vai encontrar no mapa, no barco e na conversa.
- **Os depoimentos são traduzidos** junto com o resto: o texto de cada um fica em `i18n.js`,
  nas chaves `dep.1` a `dep.5`, e o `config.js` guarda só nome, nota e passeio. Para uma
  avaliação que exista num idioma só, use o campo `texto` no lugar de `chave`.

## ⚠️ Os depoimentos que estão no ar são inventados

Os cinco textos das avaliações **não são de clientes reais**. Eles aparecem na página sem
nenhuma marca de exemplo, então quem visita lê como se fossem verdadeiros.

**Troque por avaliações reais antes de colocar o site no ar.** Publicar avaliação inventada é
propaganda enganosa, e é exatamente o tipo de coisa que derruba a confiança que o resto do
site constrói com tanto cuidado (a foto da equipe, o mapa em escala, os avisos de segurança).

As avaliações são apresentadas como próprias, sem citar Airbnb, GetYourGuide ou Google. Os
cards não têm foto de perfil: quem tiver foto real, é só preencher `foto` no `config.js`.
Airbnb e GetYourGuide continuam no rodapé e no CTA final, como canais de reserva.

## O que precisa ser preenchido antes de publicar

| # | O que | Onde | Status |
|---|-------|------|--------|
| 1 | Número do WhatsApp | `config.js` → `whatsapp.numero` e `exibicao` | ⚠️ pendente |
| 2 | Preço dos 4 passeios | `precos` | ✅ preenchido |
| 3 | Link do Instagram, do Airbnb e do GetYourGuide | `redes` | ⚠️ pendente |
| 4 | Nota média e nº de avaliações | `avaliacoes` | ⚠️ pendente |
| 5 | **Depoimentos reais** | `depoimentos` | ⚠️ **os atuais são exemplos** |
| 6 | Fotos | `fotos` + pasta `assets/img/` (ver `LEIA-ME.md` de lá) | ⚠️ capa provisória; foto da equipe já entrou |
| 7 | Fotos e vídeos da galeria | `galeria` + pasta `assets/img/galeria/` | ⚠️ só a foto da equipe até agora |

> **Atenção nos depoimentos.** Os textos que estão lá são exemplos de estrutura e
> aparecem marcados em amarelo na página, de propósito. Copie e cole avaliações
> reais do Airbnb, do GetYourGuide ou do Google antes de colocar o site no ar.
> publicar avaliação inventada é propaganda enganosa e derruba a credibilidade que
> a página inteira tenta construir.

> **A capa é a foto da cooperativa** (`hero-lagoinha-costao.jpg`), tirada do costão com o
> morro e a enseada. Por isso o crédito do Wikimedia saiu do rodapé. A foto anterior, de
> licença CC, continua no repositório em `hero-lagoinha.jpg` caso um dia seja útil; se
> voltar a usá-la, **recoloque a linha de crédito**, que é obrigatória.
>
> O arquivo veio do iPhone em HEIC, que navegador não abre. A conversão precisa **aplicar a
> orientação nos pixels e descartar a marcação EXIF**: girar com `sips -r` mantém a marcação,
> e o navegador gira de novo, deitando a foto.

### Coisas a confirmar com a cooperativa
- Meios de pagamento aceitos (está em branco na pergunta "Como pago?" do FAQ).
- Duração e formato do passeio às Moleques do Sul e às Três Irmãs (a página diz
  "meio período" e "sem desembarque" nas Moleques, por ser unidade de conservação).
- Ponto exato de embarque em cada praia.

---

## Estrutura

```
index.html                 a home
galeria.html               página de fotos e vídeos
assets/css/style.css       estilo, tudo em tokens no topo do arquivo
assets/js/config.js        ← ÚNICO arquivo de edição no dia a dia
assets/js/main.js          animações, mapa interativo, carrossel
assets/js/galeria.js       grade, filtros e visor da galeria
assets/img/                fotos (ver LEIA-ME.md)
assets/img/galeria/        fotos e vídeos da galeria
```

## A seção "A travessia"

É uma cena animada, **não um arquivo de vídeo**: céu, morros em três camadas, ilhotas e
três camadas de mar deslizando em velocidades diferentes, com a lancha balançando no lugar e
gaivotas cruzando. A embarcação é desenhada como **bote inflável com motor de popa**, que é o que a cooperativa
usa de verdade (dá para conferir na foto da equipe), e não como barco de pesca: tubo inflável
laranja formando a proa, casco rígido baixo e nada de console no meio. Para deixar o bote
cinza, troque as duas cores de `.boat-side .tubo` e `.tubo-luz` no CSS, onde há um comentário
com os valores. Tudo SVG e CSS, carrega na hora, acompanha qualquer tela e não consome
dados. Cada camada tem período que fecha o laço, então não há salto na repetição.

A seção é só a cena, sem texto: funciona como respiro visual entre a cooperativa e os
depoimentos. As durações de cada passeio já aparecem nos cards e no painel do mapa.

Se quiser a mesma cena como MP4 para anúncio ou story, dá para exportar. É só pedir.

## A seção de vídeo

Um trecho da chegada na Lagoinha, filmado do costão, **desacelerado 1,6x** e cortado em
16:9 a partir de um vídeo vertical de iPhone. O arquivo final tem **4,9 MB** para 19
segundos: 1440x810, 24 quadros por segundo, sem áudio.

Água em movimento é o pior caso para compressão de vídeo: é textura fina que muda a cada
quadro, e o compressor gasta todos os bits nela. O que resolveu foi **reduzir o ruído
antes de comprimir** (`hqdn3d`), que limpa o grão da câmera sem tirar nitidez do que
importa. Com o denoise aplicado, CRF 26, 28 e 30 ficam indistinguíveis na tela, então vale
usar o mais econômico: mesma qualidade percebida do arquivo de 9 MB, com metade do peso.

O vídeo **não é baixado junto com a página**. Enquanto a seção está longe da tela, o que
aparece é só o pôster (94 KB); o arquivo começa a carregar quando a seção se aproxima, e
pausa sozinho quando sai de vista, para não gastar bateria. Quem usa o sistema com menos
movimento ativado recebe os controles nativos em vez do laço automático.

Para trocar o vídeo, gere um novo com o mesmo formato e substitua
`assets/video/travessia.mp4` e `travessia-poster.jpg`. Dois cuidados com arquivo de
iPhone: ele costuma vir **girado por metadado** (o ffmpeg resolve sozinho) e em **Dolby
Vision**, que precisa de conversão de cor para não ficar lavado.

## A galeria (`galeria.html`)

Grade com filtro por passeio e visor em tela cheia (teclado, clique fora e arrastar no
celular). Aceita **foto e vídeo**. Enquanto `config.js` → `galeria` estiver vazio, a página
mostra um aviso honesto com link para o Instagram em vez de uma grade quebrada.

Para popular, coloque os arquivos em `assets/img/galeria/` e liste em `config.js`:

```js
galeria: [
  { tipo:"foto",  src:"assets/img/galeria/01.jpg", passeio:"lagoinha", formato:"alto",
    alt:"Barco chegando na Lagoinha do Leste", legenda:"Chegada na Lagoinha" },
  { tipo:"video", src:"assets/img/galeria/02.mp4", poster:"assets/img/galeria/02.jpg",
    passeio:"moleques", legenda:"Navegando até as Moleques" }
]
```

`passeio` vira filtro (`lagoinha` · `irmas` · `moleques` · `bordo`). O filtro só aparece
quando há variedade. `formato` controla o tamanho na grade: `alto` ocupa duas linhas,
`largo` ocupa duas colunas, vazio fica normal. Vídeo tocando no hover dá vida à grade;
mantenha os arquivos **abaixo de 5 MB** e mudos.

## Preços que estão no ar

| Passeio | Valor | Observação |
|---|---|---|
| Pântano do Sul → Lagoinha do Leste | **R$ 80** o trajeto · R$ 160 ida e volta | trajeto avulso permite ir de barco e voltar pela trilha |
| Pântano do Sul → Ilha das Três Irmãs | **R$ 100** ida e volta | 2 horas · mínimo 8 pessoas, com reserva antecipada |
| Pântano do Sul → Ilhas Moleques do Sul | **R$ 200** ida e volta | 4 horas · mínimo 8 pessoas, com reserva antecipada |

Os dois passeios de ilha saem só com grupo fechado de **8 pessoas ou mais** e precisam ser
combinados com antecedência. Isso aparece com destaque no card, no FAQ e na nota de condições.
**Todos os passeios estão sujeitos às condições meteorológicas e de navegação** e podem ser
cancelados; o aviso está na seção "Como funciona", no FAQ e no rodapé.

Duração de cada passeio fica em `config.js` → `duracoes` e aparece no painel do mapa.

Editar em `assets/js/config.js` → `precos`.

## O mapa

Não é desenho: a linha de costa, as ilhas e as distâncias vêm do **OpenStreetMap**, projetadas
para o enquadramento que vai da Armação até as Moleques do Sul. Tem barra de escala de 2 km.
As três rotas foram ajustadas por um otimizador até nenhuma cruzar terra. A verificação **não é
feita contra um polígono paralelo, e sim contra uma máscara de pixels do mapa realmente
desenhado**: o SVG é renderizado só com a terra, virá uma matriz de 1 e 0, e cada ponto amostrado
da rota é testado nessa matriz. É a única forma de garantir que o caminho passa pela água, e foi
assim que apareceu uma rota que cruzava a península apesar de "passar" no teste antigo.
A licença do OpenStreetMap (ODbL) exige a atribuição que está sob o mapa; não apague.

O barquinho que percorre a rota **não gira**: fica sempre de pé e só desliza pelo caminho.

O rótulo "Oceano Atlântico" não é enfeite: é o recurso que cartas náuticas usam para o mar
vazio não ficar vazio. Sem ele o centro do mapa abria um buraco, principalmente no celular.

O otimizador também penaliza **quebra de direção**, então em mar aberto o traçado sai reto,
como um barco faria. Sem isso a rota das Moleques ganhava uma dobra no meio do nada que
parecia defeito. Saída e chegada ficam de fora do cálculo de folga: encostar na praia e na
ilha faz parte do percurso.

Para mexer no mapa (mudar enquadramento, adicionar destino), os scripts que o geraram estão
descritos no histórico do git; o SVG final está embutido no `index.html`.

## Sobre o texto

O projeto não usa travessão (o traço longo) em nenhum texto: é um dos tiques mais reconhecíveis de
texto gerado por IA. Onde ele apareceria, a frase foi reescrita com vírgula, dois-pontos
ou ponto final. Se for editar a copy, mantenha essa regra.

## Marca

- **A logo é a real da cooperativa** (proa de barco com "Pântano do Sul" e "Lagoinha do
  Leste" em arco). O arquivo que veio do cliente está guardado em
  `assets/img/logo-original.png`; dele saíram, com fundo transparente:
  `logo-clara.png` (para fundos escuros, é a que o site usa), `logo-escura.png`
  (para fundos claros), `proa.png` (só o símbolo, sem o texto em arco) e
  `favicon.png`. Para trocar a logo, substitua o original e gere as versões de novo.
- **O ícone da aba é a marca oficial das redes**: degradê `#FFD21E → #5FB733` com o
  símbolo preto, igual à foto de perfil do Instagram. Os arquivos de 16 e 32px têm o
  traço engrossado, porque nesse tamanho as linhas finas do desenho somem.
- **O cabeçalho e o rodapé usam só o símbolo**, sem o texto em arco, que era ilegível
  naquele tamanho. O nome da marca aparece escrito ao lado.
- **Verde `#5fb733`, o mesmo da logo**, como cor única de ação. Botão é sempre verde sólido;
  o degradê amarelo-verde fica reservado para a marca. O par para texto sobre fundo claro é
  `#3d7a1c` (5:1) e o texto dentro do botão é `#07230a` (6,6:1). Branco no botão daria só
  2,5:1 e por isso não é usado.
- Fundo de mar profundo `#04161b` nas seções de impacto, areia clara nas de leitura.
- Tipografia: Bricolage Grotesque (títulos) + Inter (texto).
- Todos os valores estão em variáveis no topo do `style.css`. Trocar a cor da marca
  é trocar `--lime`.

## Seções, na ordem

1. **Hero**: foto da Lagoinha ocupando a tela, promessa do carro-chefe e CTA. Na base, três
   camadas de onda deslizando em velocidades e sentidos diferentes fazem a emenda com a seção
   seguinte (o mesmo efeito reaparece invertido no CTA final).
3. **Cooperativa**: turismo ecológico, gente da região, segurança
4. **A travessia**: cena animada, sem texto (ver acima)
5. **Depoimentos**: carrossel
6. **Como funciona**: 3 passos, tira o medo de agendar
7. **FAQ**: quebra as objeções antes do WhatsApp
8. **CTA final**, com Instagram / Airbnb / GetYourGuide

## Acessibilidade e desempenho

- Sem biblioteca externa: só a fonte do Google Fonts sai pela rede.
- Respeita `prefers-reduced-motion` (todas as animações desligam).
- Navegável por teclado, com foco visível e `aria-label` nos ícones.
- Três formatos: desktop, tablet e celular. O corpo da página nunca rola na horizontal.

## Publicar como Artifact (link rápido para mostrar)

`artifact.html` é a mesma home preparada para o formato Artifact do Claude: sem as tags
`<!doctype>`, `<html>`, `<head>` e `<body>`, que lá são montadas na publicação. Ele é gerado
a partir do `index.html`, então **não edite os dois**: mexa no `index.html` e refaça o
`artifact.html` com o trecho abaixo.

```bash
python3 - <<'EOF'
import re
s = open('index.html', encoding='utf-8').read()
head = re.search(r'<head>(.*?)</head>', s, flags=re.S).group(1)
body = re.search(r'<body[^>]*>(.*?)</body>', s, flags=re.S).group(1)
manter = [l.strip() for l in head.strip().split('\n')
          if l.strip().startswith('<title>') or 'name="description"' in l
          or 'fonts.googleapis' in l or 'fonts.gstatic' in l or 'stylesheet" href="assets' in l]
open('artifact.html','w',encoding='utf-8').write('\n'.join(manter) + '\n' + body.strip() + '\n')
EOF
```

O Artifact serve CSS, JS, imagens e o vídeo como arquivos de apoio, e bloqueia qualquer
requisição externa, com uma exceção: o Google Fonts, que é justamente o que o site usa.

## Publicar

É um site estático e sobe em qualquer lugar sem configuração:
Netlify, Vercel, Cloudflare Pages, GitHub Pages ou qualquer hospedagem comum
(basta enviar a pasta por FTP).
