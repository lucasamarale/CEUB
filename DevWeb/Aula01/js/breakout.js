/* ==========================================================================
   William Arena — Breakout
   Bola com movimento contínuo, raquete controlada por mouse/toque/teclado e
   uma parede de blocos. O ângulo de rebote depende do ponto de impacto na
   raquete — é o que separa o Breakout de um Pong com blocos.
   ========================================================================== */
'use strict';

(function () {

  const canvas = document.getElementById('brk-canvas');
  if (!canvas) return;

  /* ---------------------------- configuração ---------------------------- */
  const LARGURA = 640;
  const ALTURA  = 480;

  const COLUNAS = 9;
  const LINHAS  = 5;
  const BLOCO_A = 22;                     // altura do bloco
  const ESPACO  = 8;
  const TOPO    = 64;
  const MARGEM  = 28;

  const RAQ_L = 104, RAQ_A = 12, RAQ_Y = ALTURA - 38;
  const RAIO  = 8;

  const VEL_INICIAL   = 300;              // pixels por segundo
  const VEL_POR_NIVEL = 34;
  const VEL_RAQUETE   = 460;              // teclado, pixels por segundo
  const ANGULO_MAX    = 1.05;             // ~60° de desvio máximo

  const CORES_LINHA = ['#22E0F0', '#59C8F5', '#8FA8F7', '#A78BFF', '#7C4DFF'];

  const ctx = window.WA.prepararCanvas(canvas, LARGURA, ALTURA);

  /* ---------------------------- elementos ------------------------------- */
  const elPontos    = document.getElementById('brk-score');
  const elNivel     = document.getElementById('brk-level');
  const elVidas     = document.getElementById('brk-lives');
  const overlay     = document.getElementById('brk-overlay');
  const ovTitulo    = document.getElementById('brk-overlay-title');
  const ovTexto     = document.getElementById('brk-overlay-text');
  const btIniciar   = document.getElementById('brk-start');
  const btPausar    = document.getElementById('brk-pause');
  const btReiniciar = document.getElementById('brk-restart');
  const painel      = document.getElementById('panel-breakout');

  /* ---------------------------- estado ---------------------------------- */
  let blocos, bola, raqueteX, pontos, nivel, vidas;
  let rodando = false, pausado = false, presa = true;
  let esquerda = false, direita = false;
  let ultimoQuadro = 0;

  const BLOCO_L = (LARGURA - MARGEM * 2 - ESPACO * (COLUNAS - 1)) / COLUNAS;

  function montarBlocos() {
    blocos = [];
    for (let l = 0; l < LINHAS; l++) {
      for (let c = 0; c < COLUNAS; c++) {
        blocos.push({
          x: MARGEM + c * (BLOCO_L + ESPACO),
          y: TOPO + l * (BLOCO_A + ESPACO),
          vivo: true,
          cor: CORES_LINHA[l],
          valor: (LINHAS - l) * 10          // linhas de cima valem mais
        });
      }
    }
  }

  function recolocarBola() {
    presa = true;
    raqueteX = (LARGURA - RAQ_L) / 2;
    bola = { x: LARGURA / 2, y: RAQ_Y - RAIO - 1, vx: 0, vy: 0 };
  }

  function lancarBola() {
    if (!presa) return;
    presa = false;
    const v = VEL_INICIAL + (nivel - 1) * VEL_POR_NIVEL;
    const angulo = (Math.random() * 0.6 - 0.3) - Math.PI / 2;   // sobe com leve desvio
    bola.vx = Math.cos(angulo) * v;
    bola.vy = Math.sin(angulo) * v;
  }

  function iniciarEstado() {
    pontos = 0; nivel = 1; vidas = 3;
    pausado = false;
    montarBlocos();
    recolocarBola();
    atualizarPlacar();
  }

  function atualizarPlacar() {
    elPontos.textContent = pontos;
    elNivel.textContent = nivel;
    elVidas.textContent = vidas;
  }

  /* ---------------------------- desenho --------------------------------- */
  function desenhar() {
    ctx.fillStyle = '#05070F';
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // linhas de fundo
    ctx.strokeStyle = '#12162A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 40; y < ALTURA; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(LARGURA, y + .5); }
    ctx.stroke();

    // blocos
    blocos.forEach(function (b) {
      if (!b.vivo) return;
      ctx.fillStyle = b.cor;
      ctx.fillRect(b.x, b.y, BLOCO_L, BLOCO_A);
      ctx.fillStyle = 'rgba(5, 7, 15, .35)';
      ctx.fillRect(b.x, b.y + BLOCO_A - 4, BLOCO_L, 4);
    });

    // raquete
    const grad = ctx.createLinearGradient(raqueteX, 0, raqueteX + RAQ_L, 0);
    grad.addColorStop(0, '#7C4DFF');
    grad.addColorStop(1, '#22E0F0');
    ctx.fillStyle = grad;
    ctx.fillRect(raqueteX, RAQ_Y, RAQ_L, RAQ_A);

    // bola
    ctx.save();
    ctx.shadowColor = 'rgba(34, 224, 240, .55)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#EEF1FF';
    ctx.beginPath();
    ctx.arc(bola.x, bola.y, RAIO, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (presa && rodando && !pausado) {
      ctx.fillStyle = '#7C85A6';
      ctx.font = "500 13px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('CLIQUE OU ESPAÇO PARA LANÇAR', LARGURA / 2, RAQ_Y - 34);
    }
  }

  /* ---------------------------- física ---------------------------------- */
  function atualizar(dt) {
    // raquete pelo teclado
    if (esquerda) raqueteX -= VEL_RAQUETE * dt;
    if (direita)  raqueteX += VEL_RAQUETE * dt;
    raqueteX = window.WA.limitar(raqueteX, 0, LARGURA - RAQ_L);

    if (presa) {
      bola.x = raqueteX + RAQ_L / 2;
      bola.y = RAQ_Y - RAIO - 1;
      return;
    }

    // integra em passos pequenos para não atravessar blocos em alta velocidade
    const passos = Math.max(1, Math.ceil(Math.hypot(bola.vx, bola.vy) * dt / 6));
    const h = dt / passos;

    for (let i = 0; i < passos; i++) {
      bola.x += bola.vx * h;
      bola.y += bola.vy * h;

      // paredes laterais e teto
      if (bola.x - RAIO < 0)        { bola.x = RAIO; bola.vx = Math.abs(bola.vx); }
      if (bola.x + RAIO > LARGURA)  { bola.x = LARGURA - RAIO; bola.vx = -Math.abs(bola.vx); }
      if (bola.y - RAIO < 0)        { bola.y = RAIO; bola.vy = Math.abs(bola.vy); }

      // raquete
      const naFaixa = bola.y + RAIO >= RAQ_Y && bola.y - RAIO <= RAQ_Y + RAQ_A;
      if (naFaixa && bola.vy > 0 && bola.x >= raqueteX - RAIO && bola.x <= raqueteX + RAQ_L + RAIO) {
        // -1 na ponta esquerda, 0 no centro, +1 na ponta direita
        const impacto = ((bola.x - raqueteX) / RAQ_L) * 2 - 1;
        const angulo = window.WA.limitar(impacto, -1, 1) * ANGULO_MAX;
        const v = Math.hypot(bola.vx, bola.vy);
        bola.vx = Math.sin(angulo) * v;
        bola.vy = -Math.cos(angulo) * v;
        bola.y = RAQ_Y - RAIO - 1;
      }

      // blocos
      for (let j = 0; j < blocos.length; j++) {
        const b = blocos[j];
        if (!b.vivo) continue;
        if (bola.x + RAIO < b.x || bola.x - RAIO > b.x + BLOCO_L
         || bola.y + RAIO < b.y || bola.y - RAIO > b.y + BLOCO_A) continue;

        b.vivo = false;
        pontos += b.valor;
        atualizarPlacar();

        // rebate no eixo de menor penetração
        const dxCentro = bola.x - (b.x + BLOCO_L / 2);
        const dyCentro = bola.y - (b.y + BLOCO_A / 2);
        if (Math.abs(dxCentro / BLOCO_L) > Math.abs(dyCentro / BLOCO_A)) {
          bola.vx = -bola.vx;
        } else {
          bola.vy = -bola.vy;
        }
        break;
      }

      // caiu embaixo
      if (bola.y - RAIO > ALTURA) { perderVida(); return; }
    }

    if (blocos.every(function (b) { return !b.vivo; })) proximoNivel();
  }

  function perderVida() {
    vidas--;
    atualizarPlacar();
    recolocarBola();

    if (vidas <= 0) {
      rodando = false;
      mostrarOverlay('Fim de jogo', 'Você fez ' + pontos + ' pontos e chegou ao nível '
        + nivel + '.', 'Jogar de novo');
    }
  }

  function proximoNivel() {
    nivel++;
    vidas++;                                 // recompensa por limpar a tela
    montarBlocos();
    recolocarBola();
    atualizarPlacar();
    mostrarOverlay('Nível ' + nivel, 'Parede limpa! A bola fica mais rápida a partir de agora.',
      'Continuar');
    rodando = false;
  }

  /* ---------------------------- laço ------------------------------------ */
  function laco(agora) {
    requestAnimationFrame(laco);

    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.05);  // trava saltos grandes
    ultimoQuadro = agora;

    if (rodando && !pausado) atualizar(dt);
    desenhar();
  }

  /* ---------------------------- fluxo ----------------------------------- */
  function mostrarOverlay(titulo, texto, rotulo) {
    ovTitulo.textContent = titulo;
    ovTexto.textContent = texto;
    btIniciar.textContent = rotulo;
    overlay.hidden = false;
  }

  function comecar(reiniciar) {
    if (reiniciar !== false) iniciarEstado();
    overlay.hidden = true;
    rodando = true;
    pausado = false;
    btPausar.textContent = 'Pausar';
    ultimoQuadro = performance.now();
  }

  function alternarPausa() {
    if (!rodando) return;
    pausado = !pausado;
    btPausar.textContent = pausado ? 'Continuar' : 'Pausar';
    if (pausado) mostrarOverlay('Pausado', 'A bola espera. Sem pressa.', 'Continuar');
    else overlay.hidden = true;
  }

  /* ---------------------------- controles ------------------------------- */
  function moverParaClientX(clientX) {
    const r = canvas.getBoundingClientRect();
    const escala = LARGURA / r.width;
    raqueteX = window.WA.limitar((clientX - r.left) * escala - RAQ_L / 2, 0, LARGURA - RAQ_L);
  }

  canvas.addEventListener('mousemove', function (e) {
    if (rodando && !pausado) moverParaClientX(e.clientX);
  });

  canvas.addEventListener('touchmove', function (e) {
    if (!rodando || pausado) return;
    e.preventDefault();
    moverParaClientX(e.touches[0].clientX);
  }, { passive: false });

  canvas.addEventListener('touchstart', function (e) {
    if (!rodando) { comecar(); return; }
    moverParaClientX(e.touches[0].clientX);
    lancarBola();
  }, { passive: true });

  canvas.addEventListener('click', function () {
    if (!rodando) { comecar(btIniciar.textContent !== 'Continuar'); return; }
    lancarBola();
  });

  document.addEventListener('keydown', function (e) {
    if (painel.dataset.active !== 'true') return;

    if (e.key === 'ArrowLeft'  || e.key.toLowerCase() === 'a') { esquerda = true; e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { direita  = true; e.preventDefault(); }

    if (e.key === ' ') {
      e.preventDefault();
      if (!rodando) { comecar(btIniciar.textContent !== 'Continuar'); return; }
      if (presa) lancarBola(); else alternarPausa();
    }
    if (e.key.toLowerCase() === 'r') { e.preventDefault(); comecar(true); }
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft'  || e.key.toLowerCase() === 'a') esquerda = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') direita  = false;
  });

  btIniciar.addEventListener('click', function () {
    // "Continuar" (pausa ou troca de nível) não deve zerar o placar
    comecar(btIniciar.textContent !== 'Continuar');
  });
  btPausar.addEventListener('click', alternarPausa);
  btReiniciar.addEventListener('click', function () { comecar(true); });

  document.addEventListener('wa:aba', function (e) {
    if (e.detail.painel !== 'panel-breakout' && rodando && !pausado) alternarPausa();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rodando && !pausado) alternarPausa();
  });

  /* ---------------------------- arranque -------------------------------- */
  iniciarEstado();
  desenhar();
  requestAnimationFrame(laco);
})();
