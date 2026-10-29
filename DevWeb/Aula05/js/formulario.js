// Comportamento do formulário de Inscrição / Contato.
// A aparência e o feedback visual são do Bootstrap; aqui ficam só as regras
// que o HTML sozinho não expressa: máscaras, dígitos do CPF e limite do PDF.

const form = document.getElementById("formulario");
const cpf = document.getElementById("cpf");
const telefone = document.getElementById("telefone");
const curriculo = document.getElementById("curriculo");
const sucesso = document.getElementById("sucesso");

const LIMITE_PDF = 5 * 1024 * 1024; // 5MB

const soDigitos = (valor) => valor.replace(/\D/g, "");

function mascaraCpf(valor) {
  return soDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Confere os dois dígitos verificadores do CPF.
function cpfValido(valor) {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

cpf.addEventListener("input", () => {
  cpf.value = mascaraCpf(cpf.value);
  cpf.setCustomValidity(cpf.value && !cpfValido(cpf.value) ? "CPF inválido" : "");
});

telefone.addEventListener("input", () => {
  telefone.value = mascaraTelefone(telefone.value);
});

curriculo.addEventListener("change", () => {
  const arquivo = curriculo.files[0];
  let erro = "";
  if (arquivo) {
    const ehPdf = arquivo.type === "application/pdf" || arquivo.name.toLowerCase().endsWith(".pdf");
    if (!ehPdf) erro = "Apenas arquivos PDF.";
    else if (arquivo.size > LIMITE_PDF) erro = "O arquivo passa de 5MB.";
  }
  curriculo.setCustomValidity(erro);
  document.getElementById("erro-curriculo").textContent = erro || "Envie um arquivo PDF de até 5MB.";
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  sucesso.classList.add("d-none");
  if (form.checkValidity()) {
    sucesso.classList.remove("d-none");
    form.reset();
    form.classList.remove("was-validated");
    return;
  }
  form.classList.add("was-validated");
});

form.addEventListener("reset", () => {
  form.classList.remove("was-validated");
  [cpf, curriculo].forEach((campo) => campo.setCustomValidity(""));
});
