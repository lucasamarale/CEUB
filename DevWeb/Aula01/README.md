# William Arena

Site de games, eSports e hardware com **arcade jogável no navegador**.
Trabalho da disciplina de Desenvolvimento Web — Ciência da Computação, CEUB, 2026.2.

**Lucas Amaral Evangelista** — RA 22508120

---

## Como abrir

Basta abrir `index.html` no navegador — não precisa instalar nada, não precisa de servidor.

Se quiser rodar com servidor local (recomendado, evita restrições de `file://`):

```bash
# Python
python3 -m http.server 8000

# ou Node
npx serve .
```

Depois acesse `http://localhost:8000`.

---

## Estrutura

```
william-arena/
├── index.html            marcação semântica de todas as seções
├── css/
│   ├── style.css         tokens de design, layout e componentes do site
│   └── games.css         estilos exclusivos do arcade
├── js/
│   ├── main.js           menu, animações, contadores, abas, formulário, utilitários
│   ├── snake.js          jogo 1 — canvas 2D, grade discreta
│   ├── breakout.js       jogo 2 — canvas 2D, física contínua
│   └── memoria.js        jogo 3 — DOM puro, sem canvas
├── assets/
│   ├── img/              logo e capas em SVG
│   └── fonts/            fonte Ranade (woff2)
└── README.md
```

**Zero dependências.** Nenhum framework, nenhuma biblioteca, nenhum build. HTML, CSS e
JavaScript puros.

---

## Decisões técnicas que valem defender na apresentação

### HTML

- **Semântico**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`,
  `<blockquote>`, `<address>`, `<footer>`. Nada de `<div>` para tudo.
- **FAQ com `<details>`/`<summary>`**: acordeão nativo do HTML, sem uma linha de JavaScript.
  O atributo `name="faq"` faz o agrupamento exclusivo (abrir um fecha os outros).
- **Acessibilidade**: `skip-link` para pular ao conteúdo, `aria-*` nas abas do arcade
  seguindo o padrão WAI-ARIA de *tabs*, `alt` descritivo nas imagens, `role="status"` para
  leitores de tela acompanharem o jogo da memória, e navegação por teclado nas abas
  (setas, Home, End).
- **`<noscript>`** avisando que o arcade precisa de JavaScript — o resto do site funciona sem.

### CSS

- **Variáveis CSS** (`:root`) para toda a paleta, tipografia e espaçamento. Trocar o tema
  inteiro é mexer em um bloco só.
- **Nomenclatura BEM** (`.card`, `.card__titulo`, `.card--variante`) para deixar claro o que
  é bloco, elemento e modificador.
- **Grid e Flexbox** no layout; nenhum `float`, nenhum framework.
- **Cantos em colchete** dos cartões feitos com `::before`/`::after` — decoração sem
  elemento extra no HTML.
- **Mobile-first nos ajustes**: três *breakpoints* (1080px, 860px, 560px).
- **`prefers-reduced-motion`**: quem configurou o sistema para reduzir animação recebe o
  site sem movimento. É acessibilidade de verdade, não enfeite.

### JavaScript

- **`'use strict'`** e IIFE em cada jogo — nenhuma variável vaza para o escopo global.
  A única coisa exposta é `window.WA`, com utilitários compartilhados.
- **`requestAnimationFrame`** em vez de `setInterval` nos jogos, com *delta time*: a
  velocidade fica igual em monitor de 60 Hz e de 144 Hz.
- **`IntersectionObserver`** para as animações de entrada e para os contadores — só anima
  o que entrou na tela, sem escutar o evento de rolagem.
- **Armazenamento tolerante a falha**: o recorde do Snake tenta o `localStorage` e cai para
  memória se estiver bloqueado (aba anônima, `file://`). Nunca quebra.
- **Validação de formulário à mão**, com `novalidate` no `<form>` para controlar as
  mensagens em português e marcar `aria-invalid` nos campos errados.

---

## Os três jogos

### 1. Snake (`js/snake.js`)

Grade discreta de 24 × 16 células. A cobra é um array de coordenadas: a cada passo
insere-se uma nova cabeça (`unshift`) e remove-se o rabo (`pop`) — **exceto** quando come,
que é o que a faz crescer.

- Colisão com parede ou com o próprio corpo encerra a partida.
- Proibida a inversão de 180°: virar para trás em cima do pescoço seria morte instantânea.
- A velocidade sobe 8 ms a cada 5 frutas, até um piso de 70 ms por passo.
- Controles: setas, `W A S D`, D-pad no toque, deslizar o dedo sobre o tabuleiro.

### 2. Breakout (`js/breakout.js`)

Movimento contínuo com integração por *delta time*.

- **O detalhe que importa**: o ângulo de saída da bola depende de *onde* ela bate na
  raquete — centro devolve reto, pontas devolvem em até ~60°. É isso que separa o Breakout
  de um Pong com blocos, porque dá controle ao jogador.
- A colisão com bloco rebate no **eixo de menor penetração**, evitando o bug clássico de a
  bola atravessar a parede na diagonal.
- A física é integrada em passos pequenos quando a bola está rápida (*substepping*), para
  não pular por cima de um bloco entre dois quadros.
- Blocos das linhas de cima valem mais pontos. Limpar a tela sobe de nível, acelera a bola
  e devolve uma vida.

### 3. Jogo da memória (`js/memoria.js`)

Sem canvas: 16 botões no DOM, virados com `transform: rotateY(180deg)` e
`backface-visibility: hidden`.

- Embaralhamento **Fisher-Yates** — imparcial, ao contrário do truque comum
  `sort(() => Math.random() - 0.5)`, que distribui mal.
- Cronômetro que **acumula tempo decorrido** em vez de olhar só o relógio de parede, para
  que pausar (trocar de aba) realmente pause.
- Os 8 ícones são SVG desenhados à mão no arquivo, sem imagem externa.

---

## Sobre as imagens

As capas dos quatro jogos em destaque e o logo são **SVG originais**, criados para este
trabalho. A escolha foi deliberada:

- **Vetorial**: nítido em qualquer resolução, do celular ao projetor da sala.
- **Leve**: os cinco arquivos juntos somam menos que uma única foto em JPG.
- **Sem problema de licença**: capa de jogo real é obra protegida por direito autoral.
  Usar arte própria elimina o risco num trabalho acadêmico que vai ser publicado.

Se quiser trocar por fotos ou artes de banco de imagens, os `<img>` já estão no lugar com
`alt`, `width`, `height` e `loading="lazy"`. Basta substituir o arquivo em `assets/img/`
mantendo a proporção **16:9**.

Fontes gratuitas e com licença clara para arte de jogo, caso queira:

| Fonte | Licença | Observação |
|---|---|---|
| [Kenney](https://opengameart.org/content/all-cc0-uploader-kenney) | CC0 (domínio público) | Milhares de sprites e ícones, uso livre até comercial |
| [OpenGameArt](https://opengameart.org) | varia por item — filtre por CC0 | Sempre confira a licença de cada arquivo |
| [itch.io — game assets](https://itch.io/game-assets/free) | varia | Muitos packs gratuitos de artistas independentes |

Em qualquer um deles, **cheque a licença item a item** e credite quando exigido.

---

## Fontes tipográficas

O site usa **Space Grotesk**, **Manrope** e **JetBrains Mono**, carregadas do Google Fonts.
Se abrir sem internet, o navegador cai para a pilha de fallback (Helvetica/Arial) — o layout
continua correto, só muda a tipografia. Para garantir a tipografia offline, baixe os `.woff2`
e troque o `<link>` do Google por um `@font-face` local, como já é feito com a fonte Ranade
em `assets/fonts/`.

---

## Compatibilidade

Testado no Chromium 1440 × 940 e em viewport móvel 390 × 844. Usa recursos com suporte amplo
em navegadores atuais: CSS Grid, `aspect-ratio`, `IntersectionObserver`, `backdrop-filter`,
`<details name>`. Em navegadores antigos o conteúdo continua legível — degrada, não quebra.
