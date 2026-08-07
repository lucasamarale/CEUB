/* ==========================================================================
   William Arena — Snake
   Grade 20x20. A cobra anda em passos discretos; a velocidade aumenta a cada
   5 frutas. Colisão com a parede ou com o próprio corpo encerra a partida.
   ========================================================================== */
'use strict';

(function () {

  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;

  /* ---------------------------- configuração ---------------------------- */
  const COLUNAS   = 24;
  const LINHAS    = 16;
  const LADO      = 30;                       // pixels lógicos por célula
  const LARGURA   = COLUNAS * LADO;           // 720
  const ALTURA    = LINHAS * LADO;            // 480
  const BASE_MS   = 140;                      // intervalo inicial entre passos
  const MIN_MS    = 70;                       // intervalo mínimo (mais rápido)
  const CHAVE_REC = 'wa.snake.recorde';

  const COR = {
    fundo:    '#05070F',
    grade:    '#12162A',
    cabeca:   '#22E0F0',
    corpo:    '#7C4DFF',
    corpoAlt: '#6D3BF5',
    fruta:    '#EEF1FF',
    aura:     'rgba(34, 224, 240, .25)'
  };

  const ctx = window.WA.prepararCanvas(canvas, LARGURA, ALTURA);

  /* ---------------------------- elementos ------------------------------- */
  const elPontos    = document.getElementById('snake-score');
  const elRecorde   = document.getElementById('snake-best');
  const overlay     = document.getElementById('snake-overlay');
  const ovTitulo    = document.getElementById('snake-overlay-title');
  const ovTexto     = document.getElementById('snake-overlay-text');
  const btIniciar   = document.getElementById('snake-start');
  const btPausar    = document.getElementById('snake-pause');
  const btReiniciar = document.getElementById('snake-restart');
  const painel      = document.getElementById('panel-snake');

  /* ---------------------------- estado ---------------------------------- */
  let cobra, direcao, proximaDirecao, fruta, pontos, recorde, rodando, pausado;
  let ultimoPasso = 0, requisicao = null;

  recorde = Number(window.WA.ler(CHAVE_REC, 0)) || 0;
  elRecorde.textContent = recorde;

  function iniciarEstado() {
    cobra = [{ x: 9, y: 8 }, { x: 8, y: 8 }, { x: 7, y: 8 }];
    direcao = { x: 1, y: 0 };
    proximaDirecao = { x: 1, y: 0 };
    pontos = 0;
    pausado = false;
    elPontos.textContent = '0';
    posicionarFruta();
  }

  function posicionarFruta() {
    let nova;
    do {
      nova = {
        x: Math.floor(Math.random() * COLUNAS),
        y: Math.floor(Math.random() * LINHAS)
      };
    } while (cobra.some(function (p) { return p.x === nova.x && p.y === nova.y; }));
    fruta = nova;
  }

  /** Intervalo entre passos: encurta 8 ms a cada 5 frutas comidas. */
  function intervalo() {
    return Math.max(MIN_MS, BASE_MS - Math.floor(pontos / 5) * 8);
  }

  /* ---------------------------- desenho --------------------------------- */
  function celula(x, y, cor, margem) {
    const m = margem || 0;
    ctx.fillStyle = cor;
    ctx.fillRect(x * LADO + m, y * LADO + m, LADO - m * 2, LADO - m * 2);
  }

  function desenhar() {
    ctx.fillStyle = COR.fundo;
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // grade de fundo
    ctx.strokeStyle = COR.grade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < COLUNAS; c++) {
      ctx.moveTo(c * LADO + 0.5, 0); ctx.lineTo(c * LADO + 0.5, ALTURA);
    }
    for (let l = 1; l < LINHAS; l++) {
      ctx.moveTo(0, l * LADO + 0.5); ctx.lineTo(LARGURA, l * LADO + 0.5);
    }
    ctx.stroke();

    // fruta com brilho
    ctx.save();
    ctx.shadowColor = COR.aura;
    ctx.shadowBlur = 18;
    celula(fruta.x, fruta.y, COR.fruta, 8);
    ctx.restore();

    // corpo (do rabo para a cabeça, alternando o tom)
    for (let i = cobra.length - 1; i >= 1; i--) {
      celula(cobra[i].x, cobra[i].y, i % 2 ? COR.corpo : COR.corpoAlt, 3);
    }

    // cabeça
    ctx.save();
    ctx.shadowColor = COR.aura;
    ctx.shadowBlur = 14;
    celula(cobra[0].x, cobra[0].y, COR.cabeca, 2);
    ctx.restore();
  }

  /* ---------------------------- lógica ---------------------------------- */
  function passo() {
    direcao = proximaDirecao;

    const cabeca = { x: cobra[0].x + direcao.x, y: cobra[0].y + direcao.y };

    const bateuNaParede = cabeca.x < 0 || cabeca.y < 0
                       || cabeca.x >= COLUNAS || cabeca.y >= LINHAS;
    const bateuNoCorpo = cobra.some(function (p) {
      return p.x === cabeca.x && p.y === cabeca.y;
    });

    if (bateuNaParede || bateuNoCorpo) { fimDeJogo(); return; }

    cobra.unshift(cabeca);

    if (cabeca.x === fruta.x && cabeca.y === fruta.y) {
      pontos++;
      elPontos.textContent = pontos;
      posicionarFruta();
    } else {
      cobra.pop();                      // só cresce quando come
    }
  }

  function laco(agora) {
    requisicao = requestAnimationFrame(laco);
    if (!rodando || pausado) return;

    if (agora - ultimoPasso >= intervalo()) {
      ultimoPasso = agora;
      passo();
    }
    desenhar();
  }

  /* ---------------------------- fluxo ----------------------------------- */
  function mostrarOverlay(titulo, texto, rotuloBotao) {
    ovTitulo.textContent = titulo;
    ovTexto.textContent = texto;
    btIniciar.textContent = rotuloBotao;
    overlay.hidden = false;
  }

  function comecar() {
    iniciarEstado();
    overlay.hidden = true;
    rodando = true;
    ultimoPasso = performance.now();
    if (!requisicao) requisicao = requestAnimationFrame(laco);
  }

  function fimDeJogo() {
    rodando = false;

    if (pontos > recorde) {
      recorde = pontos;
      window.WA.gravar(CHAVE_REC, recorde);
      elRecorde.textContent = recorde;
      mostrarOverlay('Novo recorde!', 'Você fez ' + pontos +
        (pontos === 1 ? ' ponto.' : ' pontos.') + ' Ninguém segura.', 'Jogar de novo');
    } else {
      mostrarOverlay('Fim de jogo', 'Você fez ' + pontos +
        (pontos === 1 ? ' ponto.' : ' pontos.') + ' O recorde é ' + recorde + '.',
        'Tentar de novo');
    }
  }

  function alternarPausa() {
    if (!rodando) return;
    pausado = !pausado;
    btPausar.textContent = pausado ? 'Continuar' : 'Pausar';
    if (pausado) {
      mostrarOverlay('Pausado', 'Respira. Quando quiser, é só continuar.', 'Continuar');
    } else {
      overlay.hidden = true;
    }
  }

  /* ---------------------------- controles ------------------------------- */
  const TECLAS = {
    ArrowUp:    { x: 0,  y: -1 }, w: { x: 0,  y: -1 },
    ArrowDown:  { x: 0,  y: 1  }, s: { x: 0,  y: 1  },
    ArrowLeft:  { x: -1, y: 0  }, a: { x: -1, y: 0  },
    ArrowRight: { x: 1,  y: 0  }, d: { x: 1,  y: 0  }
  };

  function virar(nova) {
    if (!nova) return;
    // proíbe inverter 180° em cima do próprio pescoço
    if (nova.x === -direcao.x && nova.y === -direcao.y) return;
    proximaDirecao = nova;
  }

  document.addEventListener('keydown', function (e) {
    if (painel.dataset.active !== 'true') return;

    const nova = TECLAS[e.key] || TECLAS[e.key.toLowerCase()];
    if (nova) {
      e.preventDefault();
      if (!rodando) comecar();
      virar(nova);
      return;
    }

    if (e.key === ' ') { e.preventDefault(); rodando ? alternarPausa() : comecar(); }
    if (e.key.toLowerCase() === 'r') { e.preventDefault(); comecar(); }
  });

  document.querySelectorAll('#panel-snake .dpad button').forEach(function (bt) {
    bt.addEventListener('click', function () {
      const mapa = {
        up:    { x: 0,  y: -1 }, down:  { x: 0, y: 1 },
        left:  { x: -1, y: 0  }, right: { x: 1, y: 0 }
      };
      if (!rodando) comecar();
      virar(mapa[bt.dataset.dir]);
    });
  });

  // deslizar o dedo sobre o canvas
  let toqueX = 0, toqueY = 0;
  canvas.addEventListener('touchstart', function (e) {
    toqueX = e.touches[0].clientX;
    toqueY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - toqueX;
    const dy = e.changedTouches[0].clientY - toqueY;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (!rodando) comecar();
    virar(Math.abs(dx) > Math.abs(dy)
      ? { x: dx > 0 ? 1 : -1, y: 0 }
      : { x: 0, y: dy > 0 ? 1 : -1 });
  }, { passive: true });

  btIniciar.addEventListener('click', function () {
    if (pausado) { alternarPausa(); return; }
    comecar();
  });
  btPausar.addEventListener('click', alternarPausa);
  btReiniciar.addEventListener('click', comecar);

  // pausa automática ao trocar de aba do arcade ou de aba do navegador
  document.addEventListener('wa:aba', function (e) {
    if (e.detail.painel !== 'panel-snake' && rodando && !pausado) alternarPausa();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rodando && !pausado) alternarPausa();
  });

  /* ---------------------------- arranque -------------------------------- */
  iniciarEstado();
  rodando = false;
  desenhar();
  requisicao = requestAnimationFrame(laco);
})();
