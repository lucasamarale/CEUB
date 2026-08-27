# Aula 04, Revisão de JavaScript

Formulário de pré-matrícula da Escola Virtual, evoluído a partir do esqueleto entregue em
aula. O HTML e o CSS vieram prontos; o trabalho desta aula foi separar as folhas de estilo,
criar os campos que faltavam e escrever o JavaScript que dá comportamento ao formulário.

Disciplina de Desenvolvimento Web, Prof. William Ribeiro, 4º semestre (2026.2).

## Como abrir

Basta abrir `index.html` no navegador. Não há dependência, build ou servidor.

A busca de CEP e as listas de estado e cidade consultam serviços públicos pela internet, e
por isso precisam de conexão. Sem rede, todo o resto do formulário continua funcionando e
os campos de endereço podem ser preenchidos na mão.

## Estrutura

```
Aula04/
├── index.html
├── css/
│   ├── reset.css        zera margens e define box-sizing
│   ├── layout.css       corpo, cabeçalhos, formulário, fieldsets e grades
│   ├── formulario.css   rótulos, campos, seleção, tabela e blocos condicionais
│   └── botoes.css       enviar, limpar e o estado desabilitado
└── js/
    ├── mascaras.js      CPF, CEP, telefone, matrícula e validação do CPF
    ├── idade.js         calcula a idade a partir da data de nascimento
    ├── endereco.js      ViaCEP e IBGE, estados e cidades
    ├── matricula.js     campos que aparecem sob condição
    └── validacao.js     libera o envio e trata o submit
```

## Desafios propostos e como foram resolvidos

### 1. Separar e importar os arquivos CSS

O esqueleto trazia todo o CSS dentro de uma tag `<style>`. Ele foi dividido em quatro
folhas por responsabilidade e importado com `<link>` no `<head>`.

Optei por `<link>` e não por `@import` porque o `@import` encadeia downloads: o navegador
só descobre o segundo arquivo depois de baixar o primeiro. Com `<link>` os quatro descem em
paralelo.

A ordem importa, porque o CSS resolve empate de especificidade pelo que vem depois. Por
isso `reset.css` vem primeiro, e as regras mais específicas depois.

### 2. Campos novos de CPF e CEP

Foram acrescentados ao fieldset de Dados Pessoais, com máscara e `inputmode="numeric"`,
que faz o teclado numérico aparecer no celular.

O CPF ainda passa por validação real dos dois dígitos verificadores, em `mascaras.js`.
Máscara é só aparência: `123.456.789-00` tem o formato certo e mesmo assim é um CPF
inexistente. A validação roda no `blur` para não acusar erro enquanto a pessoa ainda digita.

### 3. Novo fieldset de Endereço

Criado com exatamente os IDs pedidos no slide: `logradouro`, `numero`, `complemento`,
`bairro`, `cidade`, `estado` e `ibge`.

O campo `ibge` foi a pista que definiu o resto da solução. Código IBGE do município não é
algo que o usuário saiba de cabeça, e é justamente um dos campos que a API do ViaCEP
devolve. Então o endereço é preenchido a partir do CEP.

### 4. Máscaras

`mascaras.js` implementa CPF, CEP e telefone. Todas seguem a mesma estratégia: extrair só
os dígitos, cortar no tamanho máximo e reinserir os separadores conforme a quantidade
digitada.

Isso resolve o problema clássico das máscaras ingênuas, que só concatenam o separador no
final: elas funcionam ao digitar e quebram ao apagar. Reconstruindo a string inteira a cada
tecla, apagar funciona igual.

O telefone muda de formato sozinho: com dez dígitos vira `(61) 3333-4444`, com onze vira
`(61) 9 9999-8888`.

### 5. Idade calculada

A idade é derivada da data de nascimento e o campo é somente leitura.

O detalhe que a maioria erra é subtrair apenas os anos. Quem nasceu em dezembro de 2000 não
tem 26 anos em agosto de 2026, tem 25. O cálculo compara mês e dia para descontar o ano
quando o aniversário ainda não chegou.

### 6. Estado e cidade

Os dois são `select`, e a cidade depende do estado. A lista de estados vem da API de
localidades do IBGE, e as cidades são buscadas só depois que um estado é escolhido.

Enquanto nenhum estado estiver selecionado, o campo de cidade fica desabilitado e exibe
"Selecione primeiro o estado". Escolher a cidade preenche também o código IBGE.

### 7. Segunda língua para o 5º ano

O bloco de segunda língua nasce com o atributo `hidden` e só aparece quando a série
escolhida é o 5º ano.

Ao ser escondido de novo, os rádios são desmarcados. Sem isso, alguém poderia escolher o 5º
ano, marcar Espanhol, voltar para o 3º ano e enviar o formulário com uma segunda língua
invisível na tela.

### 8. Telefone do responsável no turno da tarde

Mesma mecânica: marcar o turno da tarde revela o campo, marcar a manhã esconde e limpa. O
foco vai direto para o campo revelado, para não obrigar o usuário a procurá-lo.

### 9. Envio desabilitado até ter nome e telefone

O botão de envio começa desabilitado e só libera quando o nome tem pelo menos três
caracteres e o telefone tem dez ou onze dígitos.

Verificar apenas se o campo não está vazio deixaria passar um telefone com dois dígitos, o
que transformaria a regra em enfeite.

No `submit` existe um `event.preventDefault()`. Como não há back-end nesta etapa, sem ele o
navegador recarregaria a página e apagaria tudo. Os dados são montados com `FormData` e
exibidos no console.

## Exercício de Git, desfazer alterações

O exercício do início da aula, executado no terminal. Saída real:

```console
$ git log --oneline
01c68b9 commit inicial

$ touch teste.txt
$ git add .
$ git commit -m "adicionar teste.txt"
1a17eeb adicionar teste.txt

$ git log --oneline
1a17eeb adicionar teste.txt
01c68b9 commit inicial

$ git reset --soft HEAD~1
$ git status --short
A  teste.txt

$ git log --oneline
01c68b9 commit inicial

$ git reset --hard HEAD
HEAD is now at 01c68b9 commit inicial

$ git status --short
$ ls
arquivo.txt
```

O que os três modos fazem:

| Comando | Histórico | Área de stage | Arquivos no disco |
|---|---|---|---|
| `git reset --soft HEAD~1` | volta um commit | preserva | preserva |
| `git reset --mixed HEAD~1` | volta um commit | limpa | preserva |
| `git reset --hard HEAD~1` | volta um commit | limpa | descarta |

Uma observação sobre a sequência do slide: depois do `git reset --soft HEAD~1` você já está
no commit anterior. Rodar `git reset --hard HEAD~1` em seguida desfaz **mais um** commit, e
não o mesmo. Para descartar apenas as alterações que ficaram no stage, o comando é
`git reset --hard HEAD`, que foi o usado acima.

Vale lembrar que `--hard` apaga trabalho não commitado sem confirmação e sem lixeira. Commit
descartado ainda pode ser recuperado por um tempo com `git reflog`; arquivo que nunca foi
commitado, não.

## Decisões que valem defender

- **`defer` nos scripts** em vez de colocá-los no fim do `<body>`. Os arquivos baixam em
  paralelo com o HTML e executam na ordem declarada, com o DOM já pronto.
- **`'use strict'` e IIFE em cada arquivo**, para que nenhuma variável vaze para o escopo
  global. A única coisa exposta de propósito é `window.Mascaras`.
- **`async` e `await` com `try/catch`** nas chamadas de rede. Todo erro tem mensagem para o
  usuário e registro no console, e nunca uma tela em branco silenciosa.
- **O ViaCEP responde 200 mesmo quando o CEP não existe**, sinalizando com `{ "erro": true }`
  no corpo. Verificar apenas `response.ok` deixaria passar.
- **Blocos condicionais limpam o valor ao serem escondidos**, para que a tela e os dados
  enviados nunca discordem.
- **Idade e código IBGE são somente leitura**, porque são dados derivados. Campo derivado
  editável é fonte garantida de inconsistência.

## Serviços consultados

| Serviço | Uso |
|---|---|
| [ViaCEP](https://viacep.com.br) | Endereço a partir do CEP |
| [IBGE Localidades](https://servicodados.ibge.gov.br/api/docs/localidades) | Lista de estados e municípios |

Ambos são públicos, gratuitos e não exigem chave de acesso.
