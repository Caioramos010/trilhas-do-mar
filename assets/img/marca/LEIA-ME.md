# Marca em quadrado (só o símbolo)

Geradas a partir de `../logo-original.png`, isolando a proa e **descartando o texto em
arco** ("Pântano do Sul" / "Lagoinha do Leste"), que some em tamanho pequeno.

| arquivo | fundo | símbolo | para quê |
|---|---|---|---|
| `marca-limao-branco.png` | verde limão `#c9f224` | branco | foto de perfil, adesivo, camiseta |
| `marca-limao-branco-arredondado.png` | verde limão | branco | ícone de app, avatar em UI |
| `marca-limao-escuro.png` | verde limão | tinta `#08171a` | quando precisar de leitura máxima |
| `marca-escuro-limao.png` | mar `#04161b` | verde limão | sobre fundo claro, material impresso |
| `proa-branca-transparente.png` | transparente | branco | para sobrepor em foto ou cor própria |

Todos em 1024x1024, menos o transparente, que sai no tamanho do símbolo (353x317).

**Sobre o branco no limão:** o contraste medido é 1,3:1, que reprovaria para texto. Para
traço grosso funciona, e é o par que o cliente pediu. Se a peça for pequena (favicon,
ícone de 32px) ou impressa em baixa qualidade, prefira `marca-limao-escuro.png`, que tem
14:1.

## Como regerar

O script está descrito no histórico do git. O ponto não óbvio: o texto em arco é
**vazado** dentro da faixa grossa, então não basta apagar as letras — é preciso preencher
todo vazio que não se conecta à borda da imagem, senão as letras voltam como buracos.
