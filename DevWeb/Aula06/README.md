# Aula 06, React do zero

O passo a passo da aula **Construindo o React do Zero**: um projeto React montado à mão, sem
create-react-app nem Vite, para enxergar o que essas ferramentas fazem por baixo. O Babel
traduz o JSX para JavaScript que o navegador entende, e o Browserify junta tudo, inclusive o
próprio React, num único `bundle.js`.

Disciplina de Desenvolvimento Web, Prof. William Ribeiro, 4º semestre (2026.2).

## Como abrir

O `bundle.js` e o `bundle.css` já estão gerados no repositório, então basta abrir o
`index.html` no navegador.

Para gerar de novo depois de mudar o código:

```bash
npm install
npm run build
```

## Estrutura

```
Aula06/
├── package.json          dependências e os scripts de build
├── index.html            o palco: só a div#app e os dois bundles
├── css/
│   ├── app.css           estilo geral
│   └── components/       um arquivo por componente
├── images/
├── js/
│   ├── source/           o ateliê: JSX escrito à mão
│   │   ├── app.js
│   │   └── components/   Saudacao, ListaDisciplinas, Contador e Botao
│   └── build/            gerado pelo Babel, fora do Git
├── bundle.js             gerado pelo Browserify
└── bundle.css            gerado pela concatenação dos CSS
```

## O build, passo a passo

Os três scripts do `package.json` são os mesmos da aula:

| Script | O que faz |
|---|---|
| `build:js` | `babel js/source -d js/build` traduz o JSX e o ES6 para ES5; `browserify js/build/app.js -o bundle.js` segue os `import` e empacota tudo num arquivo |
| `build:css` | `cat css/*/*.css css/*.css > bundle.css` junta as folhas num arquivo só |
| `build` | roda os dois em sequência, com um único `npm run build` |

Os presets `react` e `es2015` do Babel ficam no próprio `package.json`, então o comando não
precisa do `--presets`.

## Os componentes

- **Saudacao** recebe o nome por `props` e só exibe.
- **ListaDisciplinas** monta uma lista a partir de um array, com `key` em cada item para o
  Virtual DOM.
- **Contador** guarda um número no estado com `useState`. A cada clique, o React recalcula a
  interface e troca no DOM real só o número que mudou.
- **Botao** é reaproveitado três vezes pelo Contador.

## Diferença em relação ao slide

A aula usa `ReactDOM.render`, a forma do React 17. Este projeto usa o React 18, em que o
equivalente é `createRoot(...).render(...)`, importado de `react-dom/client`. O resultado é o
mesmo, e o `ReactDOM.render` aparece como obsoleto no console do React 18.
