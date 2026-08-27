# CEUB

Trabalhos e exercícios do curso de Ciência da Computação no CEUB.

**Lucas Amaral Evangelista**, RA 22508120, turma UN 0726 (Asa Norte, noturno)

## Estrutura

O repositório é organizado por disciplina, e cada disciplina por aula ou entrega:

```
CEUB/
└── DevWeb/          Desenvolvimento Web, 4º semestre (2026.2)
    ├── Aula01/      Site William Arena
    ├── Aula02/      Formulário de Pré-Matrícula, somente HTML
    ├── Aula03/      O mesmo formulário, com CSS externo em camadas
    └── Aula04/      O mesmo formulário, com JavaScript
```

## Disciplinas

| Pasta | Disciplina | Semestre |
|---|---|---|
| `DevWeb/` | Desenvolvimento Web | 2026.2 |

## Como abrir os projetos

Os projetos de `DevWeb/` são HTML, CSS e JavaScript puros, sem dependências e sem
build. Basta abrir o `index.html` da pasta no navegador.

Para servir localmente:

```bash
cd DevWeb/Aula03
python3 -m http.server 8000
```

E acessar `http://localhost:8000`.
