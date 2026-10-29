# Desenvolvimento Web

Disciplina do 4º semestre (2026.2), turma UN 0726. Prof. William Ribeiro.

## Entregas

| Pasta | Projeto | Descrição |
|---|---|---|
| [`Aula01/`](Aula01) | William Arena | Site de games, eSports e hardware com arcade jogável no navegador (Snake, Breakout e Jogo da Memória) |
| [`Aula02/`](Aula02) | Escola Virtual, só HTML | Formulário de pré-matrícula montado somente com HTML, sem CSS e sem atributo `style` |
| [`Aula03/`](Aula03) | Escola Virtual, revisão de CSS | O mesmo formulário com folha de estilo externa em cinco camadas SMACSS, box model, container queries e cascata |
| [`Aula04/`](Aula04) | Escola Virtual, revisão de JS | Máscaras, campos condicionais, busca de CEP pelo ViaCEP e validação de envio |
| [`Aula05/`](Aula05) | Inscrição / Contato em Bootstrap | Exercício da aula de Responsividade e Templates: o formulário do slide montado só com a grade, os componentes e a validação do Bootstrap |
| [`Aula06/`](Aula06) | React do zero | O passo a passo da aula de React: JSX traduzido pelo Babel, empacotado pelo Browserify e scripts de build no `package.json` |

Das aulas 01 a 04, os projetos usam HTML, CSS e JavaScript puros, sem frameworks, sem
dependências externas e sem etapa de build. A partir da Aula05 entram as ferramentas: o
Bootstrap pelo CDN na Aula05, e o React com Babel e Browserify na Aula06. Nas duas, abrir o
`index.html` continua sendo suficiente, porque o bundle da Aula06 já vai gerado.

A Aula04 consulta as APIs públicas do ViaCEP e do IBGE, então os campos de endereço
precisam de conexão. O restante funciona offline.

## A mesma página, três vezes

As aulas 02, 03 e 04 são o mesmo formulário em três estágios, e é essa repetição que
mostra a separação de responsabilidades na prática:

- **Aula02** é o esqueleto. Só HTML, estrutura e conteúdo.
- **Aula03** é a pele. O mesmo HTML, com aparência dada por CSS externo.
- **Aula04** é o músculo. O mesmo formulário, agora com comportamento.
