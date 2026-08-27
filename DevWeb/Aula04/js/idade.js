/* =============================================
   IDADE
   Calcula a idade a partir da data de nascimento e escreve no campo,
   que é somente leitura. Idade é dado derivado: digitar seria abrir espaço
   para divergir da data informada logo ao lado.
============================================= */
'use strict';

(function () {

  const nascimento = document.getElementById('nascimento');
  const idade = document.getElementById('idade');
  if (!nascimento || !idade) return;

  /**
   * Diferença em anos completos entre a data informada e hoje.
   * Subtrair só os anos erra por um quando o aniversário ainda não chegou,
   * por isso a correção pelo mês e pelo dia.
   */
  function calcularIdade(dataTexto) {
    const [ano, mes, dia] = dataTexto.split('-').map(Number);
    if (!ano || !mes || !dia) return null;

    const hoje = new Date();
    let anos = hoje.getFullYear() - ano;

    const mesAtual = hoje.getMonth() + 1;
    const aniversarioPassou = mesAtual > mes || (mesAtual === mes && hoje.getDate() >= dia);
    if (!aniversarioPassou) anos--;

    return anos;
  }

  function atualizar() {
    const anos = calcularIdade(nascimento.value);
    if (anos === null || anos < 0 || anos > 130) {
      idade.value = '';
      return;
    }
    idade.value = anos === 1 ? '1 ano' : `${anos} anos`;
  }

  nascimento.addEventListener('change', atualizar);
  nascimento.addEventListener('input', atualizar);

})();
