/* =============================================
   ENDEREÇO
   Duas integrações com serviços públicos, feitas com fetch:

   1. IBGE, para preencher a lista de estados e, a partir do estado
      escolhido, a lista de cidades daquele estado.
   2. ViaCEP, para completar o endereço a partir do CEP digitado,
      inclusive o código IBGE do município.

   Tudo é assíncrono e pode falhar: rede cai, CEP não existe, serviço fora
   do ar. Cada caso tem tratamento próprio e mensagem para o usuário.
============================================= */
'use strict';

(function () {

  const API_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades';
  const API_VIACEP = 'https://viacep.com.br/ws';

  const cep = document.getElementById('cep');
  const cepStatus = document.getElementById('cep-status');
  const logradouro = document.getElementById('logradouro');
  const complemento = document.getElementById('complemento');
  const bairro = document.getElementById('bairro');
  const estado = document.getElementById('estado');
  const cidade = document.getElementById('cidade');
  const ibge = document.getElementById('ibge');
  const numero = document.getElementById('numero');

  if (!estado || !cidade) return;

  /** Escreve uma mensagem no rodapé do campo de CEP. */
  function status(texto, erro = false) {
    if (!cepStatus) return;
    cepStatus.textContent = texto;
    cepStatus.classList.toggle('erro', erro);
  }

  /** Repõe as opções de um select, mantendo a primeira como placeholder. */
  function preencherSelect(select, itens, textoPadrao) {
    select.innerHTML = '';
    const padrao = new Option(textoPadrao, '');
    select.appendChild(padrao);
    for (const item of itens) {
      select.appendChild(new Option(item.texto, item.valor));
    }
  }

  // ---------------------------------------------------------------- estados
  async function carregarEstados() {
    try {
      const resposta = await fetch(`${API_IBGE}/estados?orderBy=nome`);
      if (!resposta.ok) throw new Error(`IBGE respondeu ${resposta.status}`);

      const estados = await resposta.json();
      preencherSelect(
        estado,
        estados.map((uf) => ({ valor: uf.sigla, texto: `${uf.sigla} - ${uf.nome}` })),
        'Selecione o estado'
      );
    } catch (erro) {
      console.error('Falha ao carregar estados:', erro);
      status('Não foi possível carregar a lista de estados.', true);
    }
  }

  // ---------------------------------------------------------------- cidades
  async function carregarCidades(uf, cidadeSelecionada = '') {
    if (!uf) {
      preencherSelect(cidade, [], 'Selecione primeiro o estado');
      cidade.disabled = true;
      return;
    }

    cidade.disabled = true;
    preencherSelect(cidade, [], 'Carregando...');

    try {
      const resposta = await fetch(`${API_IBGE}/estados/${uf}/municipios`);
      if (!resposta.ok) throw new Error(`IBGE respondeu ${resposta.status}`);

      const municipios = await resposta.json();
      preencherSelect(
        cidade,
        municipios.map((m) => ({ valor: m.nome, texto: m.nome })),
        'Selecione a cidade'
      );
      cidade.disabled = false;

      if (cidadeSelecionada) {
        cidade.value = cidadeSelecionada;
      }
    } catch (erro) {
      console.error('Falha ao carregar cidades:', erro);
      preencherSelect(cidade, [], 'Erro ao carregar cidades');
      status('Não foi possível carregar as cidades desse estado.', true);
    }
  }

  // ---------------------------------------------------------------- ViaCEP
  async function buscarCep() {
    const digitos = window.Mascaras.apenasDigitos(cep.value);

    if (digitos.length === 0) {
      status('');
      return;
    }
    if (digitos.length !== 8) {
      status('O CEP precisa ter 8 dígitos.', true);
      return;
    }

    status('Buscando endereço...');

    try {
      const resposta = await fetch(`${API_VIACEP}/${digitos}/json/`);
      if (!resposta.ok) throw new Error(`ViaCEP respondeu ${resposta.status}`);

      const dados = await resposta.json();

      // O ViaCEP devolve 200 com { erro: true } quando o CEP não existe.
      if (dados.erro) {
        status('CEP não encontrado.', true);
        return;
      }

      logradouro.value = dados.logradouro || '';
      complemento.value = dados.complemento || '';
      bairro.value = dados.bairro || '';
      ibge.value = dados.ibge || '';

      estado.value = dados.uf || '';
      await carregarCidades(dados.uf, dados.localidade);

      status('Endereço preenchido pelo CEP.');
      if (numero) numero.focus(); // o número é o único campo que a API não sabe
    } catch (erro) {
      console.error('Falha na busca de CEP:', erro);
      status('Não foi possível consultar o CEP agora.', true);
    }
  }

  // ---------------------------------------------------------------- eventos
  estado.addEventListener('change', () => {
    carregarCidades(estado.value);
    if (ibge) ibge.value = ''; // o código antigo não vale para outro estado
  });

  // Ao escolher a cidade na mão, busca o código IBGE correspondente.
  cidade.addEventListener('change', async () => {
    if (!estado.value || !cidade.value || !ibge) return;
    try {
      const resposta = await fetch(`${API_IBGE}/estados/${estado.value}/municipios`);
      if (!resposta.ok) return;
      const municipios = await resposta.json();
      const encontrado = municipios.find((m) => m.nome === cidade.value);
      ibge.value = encontrado ? encontrado.id : '';
    } catch (erro) {
      console.error('Falha ao buscar o código IBGE:', erro);
    }
  });

  if (cep) {
    cep.addEventListener('blur', buscarCep);
  }

  carregarEstados();

})();
