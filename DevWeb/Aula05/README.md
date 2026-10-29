# Aula 05, Responsividade e Templates com Bootstrap

O exercício da aula: reproduzir o formulário **Inscrição / Contato** do slide de desafios usando
o Bootstrap, sem escrever CSS próprio.

Disciplina de Desenvolvimento Web, Prof. William Ribeiro, 4º semestre (2026.2).

## Como abrir

Abra `index.html` no navegador. O Bootstrap 5.3.3 vem pelo CDN do jsDelivr, então a página
precisa de internet. Os arquivos do CDN têm verificação de integridade (`integrity`), para o
navegador recusar qualquer versão adulterada.

## Estrutura

```
Aula05/
├── index.html          o formulário, só com classes do Bootstrap
└── js/
    └── formulario.js   máscaras, validação do CPF e limite do PDF
```

## O que vem do Bootstrap

- **Grade responsiva.** `row` e `col-md-6` colocam dois campos por linha a partir de tablets e
  empilham tudo no celular. É o mobile-first da aula: o padrão é uma coluna, e o `md`
  acrescenta a segunda.
- **Componentes de formulário.** `form-control`, `form-select`, `form-check` para checkbox e
  rádios, `input-group` para o prefixo `@` do usuário e o campo de arquivo estilizado.
- **Validação visual.** A classe `needs-validation` com `novalidate` desliga os balões do
  navegador, e a `was-validated` acende as mensagens `invalid-feedback` de cada campo.
- **Utilitários.** Espaçamento (`py-4`, `g-3`, `gap-2`), sombra, cartão e cores, sem uma linha de
  CSS escrita à mão.

## O que é regra do formulário

| Campo | Regra |
|---|---|
| Nome, sobrenome, e-mail, CPF e senha | obrigatórios, marcados com `*` |
| E-mail | formato validado pelo próprio `type="email"` |
| CPF | máscara `000.000.000-00` e conferência dos dois dígitos verificadores |
| Telefone | máscara `(11) 91234-5678`, opcional |
| Senha | mínimo de 6 caracteres (`minlength`) |
| Currículo | apenas PDF, até 5MB |
| Contato | e-mail vem marcado por padrão |

O envio é simulado: com tudo válido, aparece a confirmação e o formulário é limpo. Não há
servidor recebendo os dados.
