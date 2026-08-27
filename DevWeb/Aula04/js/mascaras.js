/* =============================================
   MÁSCARAS
   Formatam CPF, CEP, telefone e matrícula enquanto o usuário digita.

   A ideia é sempre a mesma: manter apenas os dígitos, cortar no tamanho
   máximo e reinserir os separadores conforme a quantidade digitada. Assim
   apagar também funciona, o que não acontece quando se tenta apenas
   acrescentar o separador no fim.
============================================= */
'use strict';

(function () {

  /** Devolve somente os dígitos de um texto. */
  function apenasDigitos(texto) {
    return texto.replace(/\D/g, '');
  }

  /** 000.000.000-00 */
  function mascaraCpf(valor) {
    const d = apenasDigitos(valor).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  /** 00000-000 */
  function mascaraCep(valor) {
    const d = apenasDigitos(valor).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }

  /** (61) 9 9999-9999 para celular e (61) 9999-9999 para fixo. */
  function mascaraTelefone(valor) {
    const d = apenasDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  }

  /**
   * Valida CPF pelos dois dígitos verificadores.
   * Máscara é aparência; isto aqui é a regra real do documento.
   */
  function cpfValido(valor) {
    const d = apenasDigitos(valor);
    if (d.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(d)) return false; // rejeita 111.111.111-11 e afins

    const calculaDigito = (base, pesoInicial) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) {
        soma += Number(base[i]) * (pesoInicial - i);
      }
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    const primeiro = calculaDigito(d.slice(0, 9), 10);
    const segundo = calculaDigito(d.slice(0, 10), 11);
    return primeiro === Number(d[9]) && segundo === Number(d[10]);
  }

  /** Liga uma função de máscara a um campo. */
  function aplicarMascara(id, formatar) {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.addEventListener('input', () => {
      campo.value = formatar(campo.value);
    });
  }

  aplicarMascara('cpf', mascaraCpf);
  aplicarMascara('cep', mascaraCep);
  aplicarMascara('telefone', mascaraTelefone);
  aplicarMascara('telefone_responsavel', mascaraTelefone);
  aplicarMascara('matricula', mascaraCpf); // mesmo formato 000.000.000-00 do slide

  // Aviso de CPF inválido só ao sair do campo, para não brigar com quem digita.
  const cpf = document.getElementById('cpf');
  const cpfErro = document.getElementById('cpf-erro');
  if (cpf && cpfErro) {
    cpf.addEventListener('blur', () => {
      if (cpf.value === '') {
        cpfErro.textContent = '';
        cpf.classList.remove('invalido');
        return;
      }
      const ok = cpfValido(cpf.value);
      cpfErro.textContent = ok ? '' : 'CPF inválido.';
      cpf.classList.toggle('invalido', !ok);
    });
  }

  // Exposto para os outros arquivos usarem sem repetir código.
  window.Mascaras = { apenasDigitos, mascaraCpf, mascaraCep, mascaraTelefone, cpfValido };

})();
