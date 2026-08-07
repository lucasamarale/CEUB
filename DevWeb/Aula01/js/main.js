/* ==========================================================================
   William Arena — script principal
   Responsável por: menu mobile, animação de entrada, contadores, abas do
   arcade, validação do formulário e utilitários compartilhados (WA).
   ========================================================================== */
'use strict';

/* ---------------------------------------------------------------------------
   Utilitários compartilhados — expostos em window.WA para os jogos usarem
   --------------------------------------------------------------------------- */
window.WA = (function () {

  /** Armazenamento tolerante a falhas: usa localStorage quando disponível,
   *  senão guarda em memória (modo privado, file://, storage bloqueado). */
  const memoria = Object.create(null);

  function ler(chave, padrao) {
    try {
      const v = window.localStorage.getItem(chave);
      return v === null ? padrao : v;
    } catch (e) {
      return chave in memoria ? memoria[chave] : padrao;
    }
  }

  function gravar(chave, valor) {
    try {
      window.localStorage.setItem(chave, String(valor));
    } catch (e) {
      memoria[chave] = String(valor);
    }
  }

  /** Ajusta o canvas à densidade de pixels da tela (evita imagem borrada). */
  function prepararCanvas(canvas, largura, altura) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /** Limita um valor entre um mínimo e um máximo. */
  const limitar = (v, min, max) => Math.min(Math.max(v, min), max);

  /** Embaralhamento Fisher-Yates (imparcial, ao contrário de sort(random)). */
  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { ler, gravar, prepararCanvas, limitar, embaralhar };
})();


/* ---------------------------------------------------------------------------
   Inicialização
   --------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- ano do rodapé ---------- */
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const aberto = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!aberto));
      toggle.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
      links.dataset.open = String(!aberto);
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        links.dataset.open = 'false';
      }
    });
  }

  /* ---------- animação de entrada ao rolar ---------- */
  const alvos = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        const atraso = entrada.target.dataset.revealDelay || 0;
        setTimeout(function () {
          entrada.target.classList.add('is-visible');
        }, Number(atraso));
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    alvos.forEach(function (el) { observador.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- contadores animados ---------- */
  const numeros = document.querySelectorAll('[data-count-to]');

  function animarNumero(el) {
    const destino = parseFloat(el.dataset.countTo);
    const casas = Number(el.dataset.decimals || 0);
    const sufixo = el.dataset.suffix || '';
    const duracao = 1200;
    const inicio = performance.now();

    function passo(agora) {
      const t = window.WA.limitar((agora - inicio) / duracao, 0, 1);
      const suave = 1 - Math.pow(1 - t, 3);              // easeOutCubic
      const valor = (destino * suave).toFixed(casas);
      el.textContent = valor.replace('.', ',') + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  if ('IntersectionObserver' in window && numeros.length) {
    const obsNum = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        animarNumero(entrada.target);
        obsNum.unobserve(entrada.target);
      });
    }, { threshold: 0.6 });

    numeros.forEach(function (el) { obsNum.observe(el); });
  }

  /* ---------- abas do arcade ---------- */
  const abas = Array.from(document.querySelectorAll('.arcade__tabs .tab'));

  function ativarAba(aba) {
    abas.forEach(function (outra) {
      const ativa = outra === aba;
      outra.setAttribute('aria-selected', String(ativa));
      outra.tabIndex = ativa ? 0 : -1;

      const painel = document.getElementById(outra.getAttribute('aria-controls'));
      if (painel) painel.dataset.active = String(ativa);
    });

    // avisa os jogos para pausarem o que não está visível
    document.dispatchEvent(new CustomEvent('wa:aba', {
      detail: { painel: aba.getAttribute('aria-controls') }
    }));
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener('click', function () { ativarAba(aba); });

    // navegação por teclado entre abas (padrão WAI-ARIA)
    aba.addEventListener('keydown', function (e) {
      let destino = null;
      if (e.key === 'ArrowRight') destino = abas[(i + 1) % abas.length];
      if (e.key === 'ArrowLeft') destino = abas[(i - 1 + abas.length) % abas.length];
      if (e.key === 'Home') destino = abas[0];
      if (e.key === 'End') destino = abas[abas.length - 1];
      if (!destino) return;
      e.preventDefault();
      destino.focus();
      ativarAba(destino);
    });
  });

  /* ---------- formulário de contato ---------- */
  const form = document.getElementById('contato-form');

  if (form) {
    const pronto = document.getElementById('form-done');

    function mostrarErro(campo, mensagem) {
      const alvo = document.querySelector('[data-error-for="' + campo.id + '"]');
      if (alvo) alvo.textContent = mensagem;
      campo.closest('.field').classList.toggle('field--error', Boolean(mensagem));
      campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    }

    function validarCampo(campo) {
      const valor = campo.value.trim();

      if (campo.required && !valor) {
        mostrarErro(campo, 'Preencha este campo.');
        return false;
      }
      if (campo.type === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
        mostrarErro(campo, 'E-mail inválido.');
        return false;
      }
      if (campo.id === 'f-msg' && valor.length > 0 && valor.length < 12) {
        mostrarErro(campo, 'Conte um pouco mais — pelo menos 12 caracteres.');
        return false;
      }
      mostrarErro(campo, '');
      return true;
    }

    const campos = Array.from(form.querySelectorAll('input, select, textarea'));

    campos.forEach(function (campo) {
      campo.addEventListener('blur', function () { validarCampo(campo); });
      campo.addEventListener('input', function () {
        if (campo.closest('.field').classList.contains('field--error')) validarCampo(campo);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const validos = campos.map(validarCampo);
      if (validos.includes(false)) {
        const primeiroErro = form.querySelector('.field--error input, .field--error select, .field--error textarea');
        if (primeiroErro) primeiroErro.focus();
        return;
      }

      // Sem back-end: monta um mailto com tudo preenchido.
      const dados = new FormData(form);
      const corpo = [
        'Nome: ' + dados.get('nome'),
        'Nick: ' + (dados.get('nick') || '—'),
        'E-mail: ' + dados.get('email'),
        '',
        dados.get('mensagem')
      ].join('\n');

      window.location.href = 'mailto:redacao@williamarena.gg'
        + '?subject=' + encodeURIComponent('[Site] ' + dados.get('assunto'))
        + '&body=' + encodeURIComponent(corpo);

      if (pronto) pronto.dataset.open = 'true';
      form.reset();
    });
  }
});
