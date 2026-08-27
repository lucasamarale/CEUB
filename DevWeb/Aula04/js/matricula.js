/* =============================================
   INFORMAÇÕES DE MATRÍCULA
   Dois campos que só existem sob condição:

   1. Segunda língua aparece quando a série escolhida é o 5º ano.
   2. Telefone do responsável aparece quando o turno é o da tarde.

   Em ambos os casos o bloco é escondido com o atributo hidden e, ao ser
   escondido, tem os valores limpos. Sem isso o formulário enviaria uma
   escolha que o usuário nem vê mais na tela.
============================================= */
'use strict';

(function () {

  const serie = document.getElementById('serie');
  const blocoSegundaLingua = document.getElementById('bloco-segunda-lingua');
  const blocoResponsavel = document.getElementById('bloco-responsavel');
  const telefoneResponsavel = document.getElementById('telefone_responsavel');
  const radiosTurno = document.querySelectorAll('input[name="turno"]');

  /** Mostra ou esconde um bloco e limpa o que estiver dentro ao esconder. */
  function alternarBloco(bloco, visivel) {
    if (!bloco) return;
    bloco.hidden = !visivel;

    if (!visivel) {
      bloco.querySelectorAll('input[type="radio"], input[type="checkbox"]')
        .forEach((campo) => { campo.checked = false; });
      bloco.querySelectorAll('input[type="text"]')
        .forEach((campo) => { campo.value = ''; });
    }
  }

  // ------------------------------------------------- segunda língua, 5º ano
  if (serie) {
    serie.addEventListener('change', () => {
      alternarBloco(blocoSegundaLingua, serie.value === '5ano');
    });
  }

  // ------------------------------------------------- turno da tarde
  radiosTurno.forEach((radio) => {
    radio.addEventListener('change', () => {
      const tarde = document.getElementById('tarde');
      const ehTarde = Boolean(tarde && tarde.checked);
      alternarBloco(blocoResponsavel, ehTarde);
      if (ehTarde && telefoneResponsavel) telefoneResponsavel.focus();
    });
  });

  // O reset do formulário acontece depois do evento, por isso o setTimeout.
  const formulario = document.getElementById('form-matricula');
  if (formulario) {
    formulario.addEventListener('reset', () => {
      setTimeout(() => {
        alternarBloco(blocoSegundaLingua, false);
        alternarBloco(blocoResponsavel, false);
      }, 0);
    });
  }

})();
