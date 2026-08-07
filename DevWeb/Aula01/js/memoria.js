/* ==========================================================================
   William Arena — Jogo da memória
   16 cartas, 8 pares de ícones gamer desenhados em SVG. Embaralhamento
   Fisher-Yates, cronômetro e contador de jogadas. Sem canvas: DOM puro.
   ========================================================================== */
'use strict';

(function () {

  const tabuleiro = document.getElementById('mem-board');
  if (!tabuleiro) return;

  /* ------------------------ ícones (8 pares) ---------------------------- */
  const V = '#7C4DFF', C = '#22E0F0', B = '#EEF1FF';

  const ICONES = [
    { nome: 'controle', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="16" width="40" height="20" rx="9" fill="none" stroke="' + V + '" stroke-width="2.6"/><path d="M13 22v8M9 26h8" stroke="' + C + '" stroke-width="2.6" stroke-linecap="square"/><circle cx="33" cy="24" r="2.6" fill="' + B + '"/><circle cx="38" cy="29" r="2.6" fill="' + C + '"/></svg>' },

    { nome: 'troféu', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 8h18v11a9 9 0 0 1-18 0z" fill="none" stroke="' + C + '" stroke-width="2.6"/><path d="M15 11H9v3a6 6 0 0 0 6 6M33 11h6v3a6 6 0 0 1-6 6" fill="none" stroke="' + V + '" stroke-width="2.4"/><path d="M24 28v7M17 40h14M20 35h8v5h-8z" fill="none" stroke="' + B + '" stroke-width="2.4"/></svg>' },

    { nome: 'raio', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 5L12 27h9l-3 16 17-23h-9l3-15z" fill="none" stroke="' + C + '" stroke-width="2.6" stroke-linejoin="miter"/></svg>' },

    { nome: 'nave', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5l9 22-9-5-9 5z" fill="none" stroke="' + V + '" stroke-width="2.6"/><path d="M15 27l-6 8h10M33 27l6 8H29" fill="none" stroke="' + C + '" stroke-width="2.4"/><path d="M24 33v9" stroke="' + B + '" stroke-width="2.6" stroke-linecap="square"/></svg>' },

    { nome: 'dado', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="32" fill="none" stroke="' + V + '" stroke-width="2.6"/><circle cx="17" cy="17" r="3" fill="' + C + '"/><circle cx="31" cy="31" r="3" fill="' + C + '"/><circle cx="24" cy="24" r="3" fill="' + B + '"/></svg>' },

    { nome: 'coração', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40S7 30 7 19a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 11-17 21-17 21z" fill="none" stroke="' + V + '" stroke-width="2.6"/><path d="M15 19h5l2 5 3-9 2 4h6" fill="none" stroke="' + C + '" stroke-width="2.2"/></svg>' },

    { nome: 'alvo', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="none" stroke="' + V + '" stroke-width="2.6"/><circle cx="24" cy="24" r="8" fill="none" stroke="' + C + '" stroke-width="2.4"/><circle cx="24" cy="24" r="2.5" fill="' + B + '"/><path d="M24 3v6M24 39v6M3 24h6M39 24h6" stroke="' + C + '" stroke-width="2.4" stroke-linecap="square"/></svg>' },

    { nome: 'chave', svg:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="16" cy="32" r="8" fill="none" stroke="' + C + '" stroke-width="2.6"/><path d="M22 26L38 10M32 10h8v8" fill="none" stroke="' + V + '" stroke-width="2.6"/><path d="M29 19l5 5" stroke="' + B + '" stroke-width="2.4"/></svg>' }
  ];

  /* ------------------------ elementos ----------------------------------- */
  const elJogadas   = document.getElementById('mem-moves');
  const elPares     = document.getElementById('mem-pairs');
  const elTempo     = document.getElementById('mem-time');
  const elStatus    = document.getElementById('mem-status');
  const elResultado = document.getElementById('mem-result');
  const btEmbaralhar = document.getElementById('mem-restart');
  const painel      = document.getElementById('panel-memoria');

  /* ------------------------ estado -------------------------------------- */
  let cartas = [];
  let viradas = [];
  let jogadas = 0, pares = 0;
  let travado = false;

  // O cronômetro acumula o tempo já decorrido em vez de olhar só para o
  // relógio de parede — assim pausar (trocar de aba) realmente pausa.
  let decorrido = 0, marcado = null, cronometro = null;

  /* ------------------------ cronômetro ---------------------------------- */
  function formatar(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function totalMs() {
    return decorrido + (marcado === null ? 0 : Date.now() - marcado);
  }

  function tique() {
    elTempo.textContent = formatar(Math.floor(totalMs() / 1000));
  }

  function iniciarCronometro() {
    if (cronometro !== null) return;
    marcado = Date.now();
    cronometro = setInterval(tique, 250);
  }

  function pararCronometro() {
    if (cronometro === null) return;
    decorrido = totalMs();
    marcado = null;
    clearInterval(cronometro);
    cronometro = null;
  }

  function zerarCronometro() {
    pararCronometro();
    decorrido = 0;
    marcado = null;
  }

  /* ------------------------ construção do tabuleiro --------------------- */
  function montar() {
    zerarCronometro();
    jogadas = 0; pares = 0; viradas = []; travado = false;

    elJogadas.textContent = '0';
    elPares.textContent = '0/8';
    elTempo.textContent = '0:00';
    elStatus.textContent = '';
    if (elResultado) elResultado.hidden = true;

    // dois de cada ícone, depois embaralha
    const baralho = window.WA.embaralhar(ICONES.concat(ICONES));

    tabuleiro.textContent = '';
    cartas = baralho.map(function (icone, i) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'memory-card';
      botao.dataset.state = 'down';
      botao.dataset.icone = icone.nome;
      botao.setAttribute('aria-label', 'Carta ' + (i + 1) + ', virada para baixo');

      botao.innerHTML =
        '<span class="memory-card__inner">' +
          '<span class="memory-card__face memory-card__face--back"></span>' +
          '<span class="memory-card__face memory-card__face--front">' + icone.svg + '</span>' +
        '</span>';

      botao.addEventListener('click', function () { virar(botao); });
      tabuleiro.appendChild(botao);
      return botao;
    });
  }

  /* ------------------------ jogada -------------------------------------- */
  function virar(carta) {
    if (travado) return;
    if (carta.dataset.state !== 'down') return;

    iniciarCronometro();

    carta.dataset.state = 'up';
    carta.setAttribute('aria-label', 'Carta ' + carta.dataset.icone + ', virada para cima');
    viradas.push(carta);

    if (viradas.length < 2) return;

    jogadas++;
    elJogadas.textContent = jogadas;

    const [a, b] = viradas;

    if (a.dataset.icone === b.dataset.icone) {
      a.dataset.state = 'matched';
      b.dataset.state = 'matched';
      a.disabled = true;
      b.disabled = true;
      viradas = [];
      pares++;
      elPares.textContent = pares + '/8';
      elStatus.textContent = 'Par de ' + a.dataset.icone + ' encontrado. ' + pares + ' de 8.';

      if (pares === ICONES.length) vencer();
      return;
    }

    // erro: espera um pouco e desvira as duas
    travado = true;
    setTimeout(function () {
      a.dataset.state = 'down';
      b.dataset.state = 'down';
      a.setAttribute('aria-label', 'Carta virada para baixo');
      b.setAttribute('aria-label', 'Carta virada para baixo');
      viradas = [];
      travado = false;
    }, 780);
  }

  function vencer() {
    pararCronometro();
    tique();
    const tempo = elTempo.textContent;

    // 16 cartas = 8 jogadas no melhor caso teórico; abaixo de 15 já é ótimo.
    const nota = jogadas <= 14 ? 'Memória de elefante.'
               : jogadas <= 22 ? 'Muito bom.'
               : 'Fechou! Dá para melhorar.';

    const frase = 'Você venceu em ' + jogadas + ' jogadas e ' + tempo + '. ' + nota;
    elStatus.textContent = frase;

    if (elResultado) {
      elResultado.querySelector('[data-resultado-texto]').textContent = frase;
      elResultado.hidden = false;
    }
  }

  /* ------------------------ controles ----------------------------------- */
  btEmbaralhar.addEventListener('click', montar);

  document.addEventListener('keydown', function (e) {
    if (painel.dataset.active !== 'true') return;
    if (e.key.toLowerCase() === 'r') { e.preventDefault(); montar(); }
  });

  // pausa o cronômetro quando o painel sai de vista e retoma ao voltar
  document.addEventListener('wa:aba', function (e) {
    if (e.detail.painel !== 'panel-memoria') pararCronometro();
    else if (totalMs() > 0 && pares < ICONES.length) iniciarCronometro();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pararCronometro();
    else if (painel.dataset.active === 'true' && totalMs() > 0 && pares < ICONES.length) {
      iniciarCronometro();
    }
  });

  /* ------------------------ arranque ------------------------------------ */
  montar();
})();
