# Aula 03, Revisão de CSS

O mesmo formulário de pré-matrícula da Escola Virtual, agora com folha de estilo. O HTML
entregue em aula já vinha com as classes `campo-grupo`, `campo` e `botoes`, e sem uma linha
de CSS. O trabalho desta aula foi escrever esse CSS aplicando o que o slide ensina, e não
apenas deixar a página bonita.

Disciplina de Desenvolvimento Web, Prof. William Ribeiro, 4º semestre (2026.2).

## Como abrir

Abra `index.html` no navegador. Sem dependência, sem build, sem servidor.

## Estrutura

As folhas seguem as cinco camadas do SMACSS, na ordem em que são importadas:

```
Aula03/
├── index.html
└── css/
    ├── base.css      reset universal, tokens do projeto, tipografia padrão
    ├── layout.css    cabeçalho, cartão do formulário, fieldsets e a grade
    ├── modules.css   campos, rótulos, entradas, tabela e botões
    ├── state.css     foco, hover, clique, validação e desabilitado
    └── theme.css     pele visual, preferências do sistema e impressão
```

A ordem importa. A cascata resolve empate de especificidade pelo que vem depois, então
`state.css` precisa vir depois de `modules.css` para que o estado vença o componente sem
precisar de um seletor mais forte.

## O que o HTML ganhou

Apenas três mudanças, todas no `<head>`:

- `lang="pt-BR"` no lugar de `lang="en"`, porque o conteúdo é português. Isso muda
  hifenização, corretor ortográfico e a voz do leitor de tela.
- `<title>` descritivo no lugar de `Document`.
- As cinco tags `<link>`.

O corpo do documento ficou intacto de propósito. A ideia do exercício é justamente provar
que o mesmo HTML aceita infinitas aparências: se eu precisasse mexer na marcação para
conseguir estilizar, a separação de responsabilidades teria falhado.

## Conceitos do slide aplicados

### Método de importação

Externo, com `<link>`. O slide compara os três métodos: inline quebra a separação de
responsabilidades e é impossível de manter, interno serve para protótipo e arquivo único, e
externo é o padrão da indústria porque permite cache, organização e escala.

Preferi cinco `<link>` a um arquivo importando os outros com `@import`. O `@import` encadeia
downloads: o navegador só descobre o segundo arquivo depois de baixar e ler o primeiro. Com
`<link>`, os cinco descem em paralelo.

### Seletores

Estão todos os tipos do slide, cada um onde faz sentido:

| Tipo | Onde aparece | Por quê |
|---|---|---|
| Universal `*` | reset do `base.css` | limpar o padrão do navegador antes de tudo |
| Tipo | `body`, `h1`, `fieldset`, `legend`, `td` | base visual do documento |
| Classe | `.campo`, `.campo-grupo`, `.botoes` | componentes reutilizáveis |
| Atributo | `input[type="submit"]` | separar botão de envio de campo de texto |
| Agrupamento | `input, select, button, textarea` | mesma declaração, uma regra só |
| Descendente | `td label` | rótulo dentro da tabela é opção, não título |
| Filho direto | `td > strong` | só o título da coluna, sem pegar aninhados |
| Tipo mais classe | `.campo input#telefone` | reduzir o escopo a um caso específico |
| Pseudo-classe | `:hover`, `:focus-visible`, `:user-invalid` | estados |
| Pseudo-elemento | `label::after`, `h1::after` | conteúdo que não existe no HTML |

Não usei ID como seletor de estilo, mesmo havendo IDs no HTML. O slide é claro: ID tem peso
alto na cascata e serve para âncora e seção única, não para estilizar componente. Classe
mantém a especificidade baixa e previsível.

### Box model

`box-sizing: border-box` no reset universal. Sem isso, `width: 100%` mais `padding` faz o
campo vazar do pai, porque no padrão `content-box` a largura declarada conta só o conteúdo e
o padding é somado por fora. Com `border-box`, a conta passa a incluir padding e borda, que
é o comportamento que quase todo mundo espera.

### Unidades

Seguindo o slide, `rem` é o padrão do projeto: relativo à raiz, previsível, e respeita quem
aumentou a fonte padrão do navegador. A raiz fica em `font-size: 100%`, e não em pixel fixo,
justamente para não anular essa configuração.

`em` aparece só nos espaçamentos internos que devem acompanhar a fonte do próprio elemento,
como o `padding` dos campos e botões. `px` ficou restrito a espessura de borda, onde a
medida é física de verdade.

### Cascata e especificidade

Os únicos dois `!important` do projeto estão no bloco `prefers-reduced-motion`, e o motivo é
exatamente o que o slide alerta. `!important` quebra a cascata natural, então só se justifica
quando a regra precisa vencer qualquer componente sem exceção. A preferência de acessibilidade
do usuário é esse caso: nenhuma animação de botão pode ganhar dela.

### Media queries e container queries

O slide traz a matriz de decisão, e o projeto usa as duas seguindo essa matriz.

**Media query** para o macro layout, que depende da tela: largura do cartão, tamanho dos
títulos e a tabela de matrícula que deixa de ser tabela e vira empilhamento abaixo de 45rem.

**Container query** para o micro layout, que depende do espaço disponível no pai. Cada
`fieldset` foi declarado como contêiner com `container-type: inline-size`, e a `.campo-grupo`
passa de duas colunas para uma quando o fieldset tem menos de 34rem.

A diferença é prática. Se um dia este formulário for colocado dentro de uma barra lateral
estreita numa tela de 32 polegadas, a media query continuaria achando que há espaço de sobra
e manteria duas colunas espremidas. A container query empilha, porque ela mede o pai.

Vale registrar a armadilha que o slide menciona: um elemento não pode medir a si mesmo. Por
isso quem virou contêiner foi o `fieldset`, e quem responde é a `.campo-grupo` lá dentro.

### Performance

A regra de ouro do slide: nunca animar propriedade que force o navegador a recalcular o
layout. No clique dos botões, o que anima é `transform: scale(0.98)`, resolvido pela GPU.
Animar `width` ou `margin` no lugar daria o mesmo efeito visual e jogaria trabalho na thread
principal, piorando a estabilidade visual da página.

### Arquitetura

SMACSS para a organização dos arquivos, porque o slide o descreve como categorização
rigorosa e é o que melhor se encaixa em um projeto de folhas separadas.

BEM não foi aplicado como nomenclatura porque as classes vieram prontas do HTML da aula e
renomeá-las quebraria o exercício. A convenção BEM entra em projeto novo, onde eu escolho os
nomes desde o começo, como em `.campo-grupo__item` ou `.botao--perigo`.

## Detalhes que talvez não sejam óbvios

**`:has()` para marcar campo obrigatório.** A regra `.campo:has(input:required) label::after`
coloca um asterisco vermelho no rótulo de todo campo obrigatório, sem escrever nada no HTML.
Se amanhã outro campo receber `required`, o asterisco aparece sozinho.

**`:focus-visible` no lugar de `:focus`.** O anel de foco aparece para quem navega pelo
teclado e não polui a tela de quem clicou com o mouse. Remover o `outline` sem colocar nada
no lugar, que é o atalho comum, deixa a página impossível de usar sem mouse.

**`:user-invalid` no lugar de `:invalid`.** O `:invalid` vale desde o carregamento da página,
o que pinta de vermelho um campo obrigatório que a pessoa nem chegou a tocar. O
`:user-invalid` só aparece depois da interação.

**Tokens em `:root`.** Todas as cores, espaçamentos e medidas são variáveis CSS. Trocar a cor
da marca é editar uma linha, e não caçar hexadecimal em cinco arquivos.

**Ordem de carregamento e custom properties.** Os tokens são declarados no `base.css`, o
primeiro arquivo, mas o `theme.css`, o último, consegue redefini-los e alcançar regras
escritas antes. Custom property é resolvida no valor computado, e não na ordem de leitura.

## Exercício de Git, ramificação e checkout

O exercício do início da aula, executado no terminal. Saída real:

```console
$ git status
On branch main
nothing to commit, working tree clean

$ git checkout main
Already on 'main'

$ git checkout -b desenvolvimento
Switched to a new branch 'desenvolvimento'

$ git status
On branch desenvolvimento
nothing to commit, working tree clean
```

O `-b` faz duas coisas numa linha só: cria a branch e muda para ela. Sem ele seriam dois
comandos, `git branch desenvolvimento` e `git checkout desenvolvimento`.

A branch nova nasce apontando para o mesmo commit em que você estava. Ela não copia
arquivos: é só um ponteiro. Por isso criar branch é instantâneo, mesmo em repositório
grande, e por isso importa conferir em qual branch você está antes de criar a próxima.

Em Git moderno existe `git switch -c desenvolvimento`, que faz o mesmo. O `switch` foi
criado justamente porque `checkout` acumulava funções demais: trocar de branch, restaurar
arquivo e mais um punhado de coisas sem relação entre si.
