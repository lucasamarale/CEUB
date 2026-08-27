/* =============================================
   VALIDAÇÃO E ENVIO
   O botão de envio nasce desabilitado e só libera quando nome e telefone
   estão preenchidos, conforme o desafio proposto em aula.

   O telefone precisa estar completo, e não apenas ter algum caractere:
   dez dígitos para fixo, onze para celular. Aceitar qualquer coisa
   transformaria a regra em decoração.
============================================= */
'use strict';

(function () {

  const formulario = document.getElementById('form-matricula');
  const nome = document.getElementById('nome_aluno');
  const telefone = document.getElementById('telefone');
  const botao = document.getElementById('btn-enviar');
  const aviso = document.getElementById('aviso-envio');

  if (!formulario || !nome || !telefone || !botao) return;

  /** Nome preenchido e telefone com quantidade de dígitos plausível. */
  function formularioLiberado() {
    const nomeOk = nome.value.trim().length >= 3;
    const digitos = window.Mascaras.apenasDigitos(telefone.value);
    const telefoneOk = digitos.length === 10 || digitos.length === 11;
    return nomeOk && telefoneOk;
  }

  function avaliar() {
    botao.disabled = !formularioLiberado();
  }

  nome.addEventListener('input', avaliar);
  telefone.addEventListener('input', avaliar);

  formulario.addEventListener('reset', () => {
    setTimeout(() => {
      avaliar();
      if (aviso) aviso.textContent = '';
    }, 0);
  });

  formulario.addEventListener('submit', (evento) => {
    // Sem back-end nesta etapa: preventDefault evita o recarregamento da página.
    evento.preventDefault();

    if (!formularioLiberado()) {
      if (aviso) aviso.textContent = 'Preencha o nome e o telefone antes de enviar.';
      return;
    }

    const dados = Object.fromEntries(new FormData(formulario).entries());
    console.log('Dados que seriam enviados ao servidor:', dados);

    if (aviso) {
      aviso.textContent = 'Formulário validado. Os dados foram exibidos no console do navegador.';
    }
  });

  avaliar(); // estado inicial do botão

})();
