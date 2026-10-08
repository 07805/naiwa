// ⚠️ 自动生成，请勿手改 —— 改 lib/client.js 后执行 node tools/build-boot.cjs
(function () {
  'use strict';

    var module = { exports: {} };
    var exports = module.exports;

    var ASSET = '/dsh-naiwa-entrance/assets/hero.png';
    var ROOT_ID = 'naiwa-entrance-root';
    var STATUS_ID = 'naiwa-entrance-status';

    /* ================= 时间轴（毫秒） ================= */
    var T = {
      fieldIn: 100,   fieldFull: 700,
      lineStart: 250, lineFull: 1400,
      ringStart: 800, ringStep: 180,
      partStart: 800, partEnd: 1900,
      plateStart: 700, plateDur: 950, plateStagger: 42,
      shockAt: 2130,  shockDur: 640,
      fillStart: 2060, fillEnd: 2260,
      lineOutStart: 2300, lineOutEnd: 3050,
      textAt: 2250, stagger: 230,
      endAt: 4500,
      hardMax: 6000            // 硬撤：无论如何 6 秒后收掉
    };

    var C = {
      bg: '#0b0a06',
      scale: 0.74,
      centerY: 0.5,
      charCx: 0.66,
      dens: 8,
      ringHues: [],
      partHue: 45
    };

    var CSS = ''
      + '#' + ROOT_ID + '{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;overflow:hidden;'
      +   'cursor:pointer;font:14px/1.6 "Segoe UI","Microsoft YaHei",system-ui,sans-serif;color:#dfeaff}'
      + '#' + ROOT_ID + ' *{box-sizing:border-box;margin:0;padding:0}'
      + '#' + ROOT_ID + ' #naiwa-canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}'
      + '#' + ROOT_ID + ' #naiwa-copy{position:absolute;left:6%;top:50%;transform:translateY(-50%);'
      +   'max-width:36%;pointer-events:none}'
      + '#' + ROOT_ID + ' #naiwa-copy .ln{opacity:0;transform:translateY(16px)}'
      + '#' + ROOT_ID + ' #naiwa-copy.dshle-on .ln{animation:naiwaUp .8s cubic-bezier(.2,.8,.2,1) both}'
      + '@keyframes naiwaUp{to{opacity:1;transform:translateY(0)}}'
      + '#' + ROOT_ID + ' #naiwa-copy h1{font-size:46px;letter-spacing:.14em;margin:0 0 6px;font-weight:800;'
      +   'color:#f2f8ff;text-shadow:0 0 26px rgba(255,214,120,.45),0 0 70px rgba(255,180,60,.28)}'
      + '#' + ROOT_ID + ' #naiwa-copy h2{font-size:15px;letter-spacing:.3em;margin:0 0 12px;font-weight:600;'
      +   'color:#e6d3ad}'
      + '#' + ROOT_ID + ' #naiwa-copy i{display:block;height:3px;width:0;margin-top:8px;border-radius:3px;'
      +   'background:linear-gradient(90deg,#ffd166,#ff9f43,#ffe9a8,transparent)}'
      + '#' + ROOT_ID + ' #naiwa-copy.dshle-on i{animation:naiwaGr .8s cubic-bezier(.2,.8,.2,1) both}'
      + '@keyframes naiwaGr{to{width:230px}}'
      + '#' + ROOT_ID + ' #naiwa-copy h3{font-size:11px;letter-spacing:.34em;margin:12px 0 0;font-weight:500;'
      +   'color:#b09a72}'
      + '#' + ROOT_ID + ' #naiwa-skip{position:absolute;right:22px;bottom:22px;padding:7px 15px;'
      +   'border-radius:16px;cursor:pointer;background:rgba(255,255,255,.07);'
      +   'border:1px solid rgba(255,220,150,.3);color:#ffe9c2;font:13px inherit;opacity:.7}'
      + '#' + ROOT_ID + ' #naiwa-skip:hover{opacity:1}'
      + '#' + STATUS_ID + '{position:fixed;left:46px;bottom:16px;z-index:2147482100;max-width:62vw;'
      +   'padding:3px 9px;border-radius:9px;background:rgba(0,0,0,.62);color:#ffd88a;'
      +   'font:11px/1.5 Consolas,monospace;pointer-events:none;opacity:0;transition:opacity .2s}';

    var HTML = ''
      + '<canvas id="naiwa-canvas"></canvas>'
      + '<div id="naiwa-copy">'
      +   '<h1 class="ln">DeepSeek</h1>'
      +   '<h2 class="ln">欢迎来到专业工作模式</h2>'
      +   '<i class="ln"></i>'
      +   '<h3 class="ln">PROFESSIONAL WORK MODE</h3>'
      + '</div>'
      + '<button id="naiwa-skip" type="button">跳过</button>';

    function clamp(v, a, b) { return v < a ? a : v > b ? b : v }
    function easeOut(q) { return 1 - Math.pow(1 - clamp(q, 0, 1), 3) }
    function easeIn(q) { return Math.pow(clamp(q, 0, 1), 3) }
    function spike(q) { return q <= 0 || q >= 1 ? 0 : Math.sin(Math.PI * clamp(q, 0, 1)) }
    function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')' }

    /* ================= 播放一次 ================= */
    function play() {
      try { return playInner() }
      catch (err) {
        window.__dshNaiwaPlaying = false;
        var msg = String((err && err.message) || err);
        if (window.__dshNaiwaSetStatus) window.__dshNaiwaSetStatus('播放异常：' + msg, true);
        console.warn('[dsh-naiwa-entrance] play() 异常：', err);
        return null;
      }
    }

    function playInner() {
      if (window.__dshNaiwaPlaying) return null;
      window.__dshNaiwaPlaying = true;

      var styleEl = document.createElement('style');
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);

      var rootEl = document.createElement('div');
      rootEl.id = ROOT_ID;
      rootEl.setAttribute('data-dsh-naiwa-entrance', '');
      rootEl.innerHTML = HTML;
      document.body.appendChild(rootEl);

      var cvs = rootEl.querySelector('#naiwa-canvas');
      var ctx = cvs.getContext('2d');
      var copy = rootEl.querySelector('#naiwa-copy');
      var skipBtn = rootEl.querySelector('#naiwa-skip');

      var W = 0, H = 0, DPR = 1;
      var hero = null, edgeSharp = null, edgeGlow = null, heroRect = null;
      var parts = [], plates = [], motes = [];
      var textShown = false, done = false, stopped = false, t0 = 0, rafId = 0, tickId = 0, lastTick = 0;
      var timers = [];
      var gradCache = null;

      // 必须最先调用：否则 W/H 为 0、画布尺寸为 0，什么都画不出来。
      // buildParticles/buildPlates 也必须在这里各调用一次，
      // 否则 parts/plates 为空 → 粒子（短线段）和甲片全都不会出现。
      resize();
      buildParticles();
      buildPlates();
      window.__dshNaiwaInit = { parts: parts.length, plates: plates.length };
      function onWinResize() {
        if (done) return;
        resize(); buildParticles(); buildPlates();
        if (hero) buildEdges(hero);
      }
      window.addEventListener('resize', onWinResize);

      function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id }

      function resize() {
        // 全屏动画：DPR 封顶 1.5。DPR=2 时要写 4 倍像素，
        // 而开机时主线程正被应用 bundle 占满，这里省下的都是流畅度。
        DPR = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
        W = window.innerWidth; H = window.innerHeight;
        cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        heroRect = null;
        gradCache = null;
      }

      // ===== 每帧成本优化：渐变、法阵、虚线场、甲片渐变全部预生成并缓存 =====
      function ensureCache(cx, cy) {
        var key = W + 'x' + H + ':' + (heroRect ? Math.round(heroRect.w) + ',' + Math.round(heroRect.h) : 0);
        if (gradCache && gradCache.key === key) return gradCache;
        var g = { key: key };

        g.field = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
        g.field.addColorStop(0, 'rgba(196,142,44,0.30)');
        g.field.addColorStop(0.45, 'rgba(104,68,16,0.20)');
        g.field.addColorStop(1, 'rgba(11,10,6,0)');

        g.vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.28, cx, cy, Math.max(W, H) * 0.78);
        g.vig.addColorStop(0, 'rgba(0,0,0,0)');
        g.vig.addColorStop(1, 'rgba(0,0,0,0.55)');

        if (heroRect) {
          var bx = heroRect.x + heroRect.w / 2, by = heroRect.y + heroRect.h * 0.55;
          var br = Math.max(heroRect.w, heroRect.h) * 0.78;
          g.back = ctx.createRadialGradient(bx, by, 0, bx, by, br);
          g.back.addColorStop(0, 'rgba(255,206,120,0.24)');
          g.back.addColorStop(0.5, 'rgba(200,132,40,0.13)');
          g.back.addColorStop(1, 'rgba(11,10,6,0)');
        }

        // 旋转的虚线能量场 → 离屏画一次
        var ar = Math.ceil(Math.min(W, H) * (0.34 + 4 * 0.13) + 24);
        var a = document.createElement('canvas');
        a.width = a.height = ar * 2;
        var ac = a.getContext('2d');
        ac.translate(ar, ar);
        ac.setLineDash([5, 16]);
        for (var k = 0; k < 5; k++) {
          ac.beginPath();
          ac.arc(0, 0, Math.min(W, H) * (0.34 + k * 0.13), 0, Math.PI * 2);
          ac.strokeStyle = 'rgba(236,190,96,' + (0.26 * (1 - k * 0.12)) + ')';
          ac.lineWidth = 1.2;
          ac.stroke();
        }
        g.aura = a; g.auraR = ar;

        // 法阵（3 环 + 36 刻度）→ 离屏画一次
        if (heroRect) {
          var R = Math.max(heroRect.w, heroRect.h) * 0.80;
          var cr = Math.ceil(R * 1.02 + 8);
          var c2 = document.createElement('canvas');
          c2.width = c2.height = cr * 2;
          var cc = c2.getContext('2d');
          cc.translate(cr, cr);
          cc.strokeStyle = 'rgba(247,201,72,0.50)';
          cc.lineWidth = 1.6;
          for (var i = 0; i < 3; i++) {
            cc.beginPath(); cc.arc(0, 0, R * (0.62 + i * 0.19), 0, Math.PI * 2); cc.stroke();
          }
          cc.lineWidth = 1.1;
          for (var k2 = 0; k2 < 36; k2++) {
            var aa = k2 * (Math.PI * 2 / 36);
            var r0 = R * (k2 % 3 === 0 ? 0.62 : 0.80), r1 = R * 0.99;
            cc.beginPath();
            cc.moveTo(Math.cos(aa) * r0, Math.sin(aa) * r0);
            cc.lineTo(Math.cos(aa) * r1, Math.sin(aa) * r1);
            cc.stroke();
          }
          g.crest = c2; g.crestR = cr;
        }

        // 甲片渐变（14 个）→ 预生成
        g.plateGrads = plates.map(function (PL) {
          var sz = Math.min(W, H) * PL.size;
          var pg = ctx.createLinearGradient(0, -sz * 1.5, 0, sz * 1.5);
          pg.addColorStop(0, 'rgba(255,240,190,0.96)');
          pg.addColorStop(0.5, 'rgba(240,178,56,0.92)');
          pg.addColorStop(1, 'rgba(84,54,8,0.88)');
          return pg;
        });

        gradCache = g;
        return g;
      }

      function boxAt(w, h, iw, ih) {
        var s = Math.min(w / iw, h / ih) * C.scale;
        var dw = iw * s, dh = ih * s;
        return { x: (w - dw) * C.charCx, y: (h - dh) * C.centerY, w: dw, h: dh };
      }

      function buildEdges(image) {
        var EW = Math.max(640, Math.min(1400, Math.round(W)));
        var EH = Math.max(360, Math.round(EW * H / W));
        var box = boxAt(EW, EH, image.naturalWidth, image.naturalHeight);

        var off = document.createElement('canvas');
        off.width = EW; off.height = EH;
        var c = off.getContext('2d', { willReadFrequently: true });
        c.fillStyle = C.bg; c.fillRect(0, 0, EW, EH);
        c.drawImage(image, box.x, box.y, box.w, box.h);
        var src = c.getImageData(0, 0, EW, EH).data;

        var gray = new Float32Array(EW * EH);
        for (var i = 0, p = 0; p < gray.length; i += 4, p++)
          gray[p] = src[i] * .299 + src[i + 1] * .587 + src[i + 2] * .114;

        var bl = new Float32Array(EW * EH), x, y, dx, dy, px, py, sum, n;
        for (y = 0; y < EH; y++) for (x = 0; x < EW; x++) {
          sum = 0; n = 0;
          for (dy = -1; dy <= 1; dy++) { py = y + dy; if (py < 0 || py >= EH) continue;
            for (dx = -1; dx <= 1; dx++) { px = x + dx; if (px < 0 || px >= EW) continue;
              sum += gray[py * EW + px]; n++; } }
          bl[y * EW + x] = sum / n;
        }

        var mag = new Float32Array(EW * EH), maxM = 1e-6;
        for (y = 1; y < EH - 1; y++) for (x = 1; x < EW - 1; x++) {
          var q = y * EW + x;
          var tl = bl[q-EW-1], t = bl[q-EW], tr = bl[q-EW+1], l = bl[q-1], rr = bl[q+1];
          var b = bl[q+EW-1], bm = bl[q+EW], br = bl[q+EW+1];
          var gx = -tl - 2*l - b + tr + 2*rr + br;
          var gy = -tl - 2*t - tr + b + 2*bm + br;
          var m = Math.sqrt(gx*gx + gy*gy);
          mag[q] = m; if (m > maxM) maxM = m;
        }

        var hist = new Uint32Array(256), magN = new Uint8Array(EW * EH);
        for (i = 0; i < mag.length; i++) {
          var v = Math.min(255, Math.round(mag[i] / maxM * 255));
          magN[i] = v; hist[v]++;
        }
        var target = magN.length * C.dens / 100, acc = 0, thr = 255;
        for (v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= target) { thr = v; break } }

        var ccx = box.x + box.w / 2, ccy = box.y + box.h / 2;
        var MTOP = 14, MSIDE = Math.round(0.17 * Math.min(box.w, box.h));
        var im = new ImageData(EW, EH), o = im.data, span = Math.max(1, 255 - thr);
        for (y = 0; y < EH; y++) for (x = 0; x < EW; x++) {
          var idx = y * EW + x, val = magN[idx];
          if (val <= thr) continue;
          if (x < box.x + MSIDE || x > box.x + box.w - MSIDE ||
              y < box.y + MTOP || y > box.y + box.h - MSIDE) continue;
          var ang = Math.atan2(y - ccy, x - ccx);
          var hue = 38 + 20 * (0.5 + 0.5 * Math.sin(ang * 1.7));
          var rgb = hsl2rgb(hue, 92, 58);
          var k = idx * 4;
          o[k] = rgb[0]; o[k+1] = rgb[1]; o[k+2] = rgb[2];
          o[k+3] = Math.round(Math.min(1, .3 + (val - thr) / span * 1.4) * 255);
        }
        var sharp = document.createElement('canvas');
        sharp.width = EW; sharp.height = EH;
        sharp.getContext('2d').putImageData(im, 0, 0);

        var glow = document.createElement('canvas');
        glow.width = EW; glow.height = EH;
        var gc = glow.getContext('2d');
        gc.filter = 'blur(10px)'; gc.globalAlpha = 0.9; gc.drawImage(sharp, 0, 0); gc.filter = 'none';

        edgeSharp = sharp; edgeGlow = glow;
        heroRect = boxAt(W, H, image.naturalWidth, image.naturalHeight);
      }

      function hsl2rgb(h, s, l) {
        s /= 100; l /= 100;
        var k = function (nn) { return (nn + h / 30) % 12 };
        var a = s * Math.min(l, 1 - l);
        var f = function (nn) { return l - a * Math.max(-1, Math.min(k(nn) - 3, Math.min(9 - k(nn), 1))) };
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
      }

      function buildParticles() {
        parts = []; motes = [];
        for (var i = 0; i < 90; i++) {
          parts.push({
            a: Math.random() * Math.PI * 2,
            r0: Math.max(W, H) * (0.42 + Math.random() * 0.5),
            delay: Math.random() * (T.partEnd - T.partStart) * 0.55,
            w: 1 + Math.random() * 1.8,
            bright: .4 + Math.random() * .6,
            // 颜色预生成：避免每帧拼 90×2 个 hsla 字符串
            sc: hsl(C.partHue, 95, 62, 1),
            fc: hsl(C.partHue, 100, 72, 1)
          });
        }
        for (var m = 0; m < 70; m++) {
          var mh = 38 + Math.random() * 18;
          motes.push({
            x: Math.random(), y: Math.random(),
            r: 0.6 + Math.random() * 2.2,
            sp: 0.006 + Math.random() * 0.022,
            a: 0.10 + Math.random() * 0.30,
            color: hsl(mh, 90, 74, 1)
          });
        }
      }

      function buildPlates() {
        plates = [];
        var N = 14;
        for (var i = 0; i < N; i++) {
          plates.push({
            ang: -Math.PI / 2 + i * (Math.PI * 2 / N),
            delay: Math.round(i * T.plateStagger + Math.random() * 40),
            size: 0.042 + Math.random() * 0.022,
            wide: 0.85 + Math.random() * 0.5
          });
        }
      }

      function drawCrest(a, rot, cx, cy, r) {
        if (a <= 0) return;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(247,201,72,' + (0.50 * a) + ')';
        ctx.lineWidth = 1.6;
        for (var i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.arc(0, 0, r * (0.62 + i * 0.19), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.lineWidth = 1.1;
        for (var k = 0; k < 36; k++) {
          var aa = k * (Math.PI * 2 / 36);
          var r0 = r * (k % 3 === 0 ? 0.62 : 0.80), r1 = r * 0.99;
          ctx.beginPath();
          ctx.moveTo(Math.cos(aa) * r0, Math.sin(aa) * r0);
          ctx.lineTo(Math.cos(aa) * r1, Math.sin(aa) * r1);
          ctx.stroke();
        }
        ctx.restore();
      }

      function render(t) {
        try { renderInner(t); }
        catch (e) { console.warn('[dsh-naiwa-entrance] 渲染异常：', e); }
      }

      function renderInner(t) {
        var cx = W * C.charCx, cy = H * C.centerY;
        var maxR = Math.sqrt(W * W + H * H) * 0.5;
        var TAU = Math.PI * 2;

        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        var fieldQ = easeOut((t - T.fieldIn) / (T.fieldFull - T.fieldIn));
        var GC = ensureCache(cx, cy);

        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        if (fieldQ > 0) {
          ctx.globalAlpha = fieldQ;
          ctx.fillStyle = GC.field;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;
        }

        if (fieldQ > 0) {
          // 虚线能量场：预生成的离屏图，每帧只做一次 drawImage
          ctx.save();
          ctx.globalAlpha = fieldQ;
          ctx.translate(cx, cy);
          ctx.rotate(t / 9000);
          ctx.drawImage(GC.aura, -GC.auraR, -GC.auraR);
          ctx.restore();
        }

        if (fieldQ > 0) {
          for (var mi = 0; mi < motes.length; mi++) {
            var MO = motes[mi];
            var my = ((MO.y - t / 1000 * MO.sp) % 1 + 1) % 1;
            var mx = MO.x + Math.sin(t / 2600 + MO.x * 9) * 0.012;
            ctx.beginPath();
            ctx.arc(mx * W, my * H, MO.r, 0, TAU);
            ctx.globalAlpha = MO.a * fieldQ;
            ctx.fillStyle = MO.color;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }

        var bigQ = (t - 400) / 2200;
        if (bigQ > 0 && bigQ < 1) {
          ctx.beginPath();
          ctx.arc(W * 0.5, H * 0.5, easeOut(bigQ) * maxR, 0, TAU);
          ctx.strokeStyle = 'rgba(236,190,96,' + (0.15 * (1 - bigQ)) + ')';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        if (heroRect && GC.crest) {
          var crestA = clamp((t - 250) / 900, 0, 1)
            * (0.55 + 0.45 * (1 - clamp((t - T.fillStart) / (T.fillEnd - T.fillStart), 0, 1)));
          if (crestA > 0) {
            ctx.save();
            ctx.globalAlpha = crestA;
            ctx.translate(cx, cy);
            ctx.rotate(t / 14000);
            ctx.drawImage(GC.crest, -GC.crestR, -GC.crestR);
            ctx.restore();
          }
        }

        if (heroRect && GC.back) {
          var rq0 = easeOut((t - T.fillStart) / (T.fillEnd - T.fillStart));
          if (rq0 > 0) {
            ctx.globalAlpha = rq0;
            ctx.fillStyle = GC.back;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
          }
        }

        for (var i = 0; i < C.ringHues.length; i++) {
          var rs = T.ringStart + i * T.ringStep;
          var rq = (t - rs) / 1150;
          if (rq <= 0 || rq >= 1) continue;
          var rr2 = easeOut(rq) * maxR * 0.92;
          ctx.beginPath(); ctx.arc(cx, cy, rr2, 0, TAU);
          ctx.strokeStyle = hsl(C.ringHues[i], 92, 62, Math.pow(1 - rq, 1.6) * 0.45);
          ctx.lineWidth = 2 + 9 * (1 - rq);
          ctx.stroke();
        }

        for (i = 0; i < parts.length; i++) {
          var P = parts[i];
          var pq = (t - (T.partStart + P.delay)) / (T.partEnd - T.partStart - P.delay);
          if (pq <= 0 || pq >= 1) continue;
          var r = P.r0 * (1 - easeIn(pq));
          var x1 = cx + Math.cos(P.a) * r, y1 = cy + Math.sin(P.a) * r;
          var r2 = P.r0 * (1 - easeIn(Math.max(0, pq - 0.07)));
          var x2 = cx + Math.cos(P.a) * r2, y2 = cy + Math.sin(P.a) * r2;
          ctx.globalAlpha = 0.85 * P.bright * (1 - pq);
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = P.sc;
          ctx.lineWidth = P.w;
          ctx.stroke();
          ctx.globalAlpha = 0.95 * P.bright * (1 - pq);
          ctx.beginPath(); ctx.arc(x1, y1, P.w * 1.2, 0, TAU);
          ctx.fillStyle = P.fc;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        var lineQ = easeOut((t - T.lineStart) / (T.lineFull - T.lineStart));
        var lineFade = 1 - clamp((t - T.lineOutStart) / (T.lineOutEnd - T.lineOutStart), 0, 1);
        if (lineQ > 0 && lineFade > 0 && edgeSharp) {
          var rl = lineQ * maxR * 1.05;
          ctx.save();
          ctx.beginPath(); ctx.arc(cx, cy, rl, 0, TAU); ctx.clip();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.5 * lineFade;
          ctx.drawImage(edgeGlow, 0, 0, W, H);
          ctx.globalAlpha = 0.95 * lineFade;
          ctx.drawImage(edgeSharp, 0, 0, W, H);
          ctx.restore();
          if (lineQ < 1) {
            ctx.beginPath(); ctx.arc(cx, cy, rl, 0, TAU);
            ctx.strokeStyle = 'rgba(255,228,150,' + (0.45 * (1 - lineQ) + 0.1) + ')';
            ctx.lineWidth = 2 + 6 * (1 - lineQ);
            ctx.stroke();
          }
        }

        if (heroRect && plates.length) {
          var PR = Math.max(heroRect.w, heroRect.h) * 0.64;
          for (var pi = 0; pi < plates.length; pi++) {
            var PL = plates[pi];
            var pq2 = clamp((t - (T.plateStart + PL.delay)) / T.plateDur, 0, 1);
            if (pq2 <= 0) continue;
            var eq = easeOut(pq2);
            var rrr = maxR * 1.15 * (1 - eq) + PR * eq;
            var px = cx + Math.cos(PL.ang) * rrr * 1.02;
            var py = cy + Math.sin(PL.ang) * rrr * 0.80;
            var sz = Math.min(W, H) * PL.size;
            var lockF = spike((t - (T.plateStart + PL.delay + T.plateDur)) / 230);
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(PL.ang + Math.PI / 2 + (1 - eq) * 3.4);
            if (pq2 < 1) {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(PL.ang) * rrr * 0.30, Math.sin(PL.ang) * rrr * 0.30 * 0.80);
              ctx.strokeStyle = 'rgba(255,226,150,' + (0.40 * (1 - pq2)) + ')';
              ctx.lineWidth = sz * 0.14;
              ctx.stroke();
            }
            var pg = GC.plateGrads[pi] || GC.plateGrads[0];
            ctx.globalAlpha = pq2;
            ctx.beginPath();
            ctx.moveTo(0, -sz * 1.5);
            ctx.lineTo(sz * PL.wide, 0);
            ctx.lineTo(0, sz * 1.5);
            ctx.lineTo(-sz * PL.wide, 0);
            ctx.closePath();
            ctx.fillStyle = pg;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(255,248,216,' + (0.85 * pq2) + ')';
            ctx.lineWidth = 1.4 + 2.4 * lockF;
            ctx.stroke();
            if (lockF > 0) {
              ctx.beginPath();
              ctx.arc(0, 0, sz * (1.3 + lockF * 1.8), 0, TAU);
              ctx.strokeStyle = 'rgba(255,255,240,' + (0.85 * lockF) + ')';
              ctx.lineWidth = 2 + 5 * lockF;
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        var bQ = spike((t - T.shockAt) / T.shockDur);
        if (bQ > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(cx, cy);
          for (var ri = 0; ri < 20; ri++) {
            var ra2 = ri * (TAU / 20) + t / 4200;
            var RL = maxR * (0.55 + 0.45 * Math.sin(t / 320 + ri));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ra2) * RL, Math.sin(ra2) * RL);
            ctx.lineTo(Math.cos(ra2 + 0.032) * RL, Math.sin(ra2 + 0.032) * RL);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,214,110,' + (0.15 * bQ) + ')';
            ctx.fill();
          }
          ctx.restore();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(255,246,220,' + (0.34 * bQ) + ')';
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'source-over';
        }

        var fillQ = easeOut((t - T.fillStart) / (T.fillEnd - T.fillStart));
        if (hero && heroRect && fillQ > 0) {
          var rf = fillQ * maxR * 1.05;
          var settle = 1 + 0.05 * (1 - clamp((t - T.fillStart) / (T.fillEnd - T.fillStart), 0, 1));
          var dw = heroRect.w * settle, dh = heroRect.h * settle;
          var dx = heroRect.x - (dw - heroRect.w) / 2, dy = heroRect.y - (dh - heroRect.h) / 2;
          ctx.save();
          ctx.beginPath(); ctx.arc(cx, cy, rf, 0, TAU); ctx.clip();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(hero, dx, dy, dw, dh);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'rgba(255,198,112,0.14)';
          ctx.fillRect(dx, dy, dw, dh);
          ctx.restore();
          if (fillQ >= 1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.30 + 0.12 * Math.sin(t / 500);
            ctx.drawImage(edgeGlow, 0, 0, W, H);
            ctx.restore();
          }
        }

        var sq = (t - T.shockAt) / T.shockDur;
        if (sq > 0 && sq < 1) {
          var rr3 = easeOut(sq) * maxR * 0.85;
          ctx.beginPath(); ctx.arc(cx, cy, rr3, 0, TAU);
          ctx.strokeStyle = 'hsla(' + (44 + 14 * sq) + ',95%,66%,' + (0.85 * (1 - sq)) + ')';
          ctx.lineWidth = 10 * (1 - sq) + 2;
          ctx.stroke();
        }

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(126,96,44,0.14)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = GC.vig;
        ctx.fillRect(0, 0, W, H);

        var show = t >= T.textAt;
        if (show !== textShown) {
          textShown = show;
          copy.classList.toggle('dshle-on', show);
          if (show) {
            var lns = copy.querySelectorAll('.ln');
            for (var kk = 0; kk < lns.length; kk++)
              lns[kk].style.animationDelay = (kk * T.stagger) + 'ms';
          }
        }
      }

      function clearLayer() {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W, H);
      }

      function frame(now) {
        if (done) return;
        lastTick = Date.now();
        var fz = window.__dshNaiwaFreezeAt;
        render(typeof fz === 'number' ? fz
          : (typeof now === 'number' ? now : performance.now()) - t0);
        rafId = requestAnimationFrame(frame);
      }

      // 调试用：手动渲染指定时刻（不依赖 requestAnimationFrame，便于自动化截图）
      window.__dshNaiwaRenderAt = function (ms) { try { render(ms) } catch (e) { console.warn(e) } };

      function start() {
        clearLayer();
        textShown = false;
        copy.classList.remove('dshle-on');
        t0 = performance.now();
        lastTick = Date.now();
        rafId = requestAnimationFrame(frame);
        // 兜底：窗口未聚焦/最小化时 rAF 会被节流甚至暂停，此时靠定时器按墙钟继续推进，
        // 否则动画会卡在早期某一帧（看起来就像"东西少了"）。
        tickId = setInterval(function () {
          if (done) return;
          if (Date.now() - lastTick < 120) return;      // rAF 正常，交给它
          lastTick = Date.now();
          var fz = window.__dshNaiwaFreezeAt;
          render(typeof fz === 'number' ? fz : (performance.now() - t0));
        }, 120);
      }

      function stop() {
        // 注意：这里绝不能用 done 做守卫——finish() 会先把 done 置真再调 stop()，
        // 那样 stop() 会立刻返回，遮罩永远删不掉（透明但吃掉所有点击）。
        if (stopped) return;
        stopped = true;
        done = true;
        try { cancelAnimationFrame(rafId) } catch (e) {}
        try { clearInterval(tickId) } catch (e) {}
        timers.forEach(function (id) { try { clearTimeout(id) } catch (e) {} });
        timers = [];
        try { rootEl.remove() } catch (e) {}
        try { styleEl.remove() } catch (e) {}
        try { window.removeEventListener('resize', onWinResize) } catch (e) {}
        try { delete window.__dshNaiwaRenderAt } catch (e) {}
        window.__dshNaiwaPlaying = false;
      }

      function finish() {
        if (done) return;
        done = true;
        try { cancelAnimationFrame(rafId) } catch (e) {}
        rootEl.style.transition = 'opacity .7s ease';
        rootEl.style.opacity = '0';
        later(function () { stop() }, 760);
      }

      // 只绑在遮罩自身上：点画面任意处 = 跳过（不劫持全局事件）
      rootEl.addEventListener('click', finish);
      skipBtn.addEventListener('click', function (e) { e.preventDefault(); finish() });
      function onKey(e) { if (e.key === 'Escape') finish() }
      window.addEventListener('keydown', onKey);

      var img = new Image();
      window.__dshNaiwaDiag = 'img.src=' + ASSET;
      img.onload = function () {
        hero = img;
        var tLoad = performance.now();
        try {
          // 关键：这里只做"便宜"的取景计算，然后立刻开播。
          // 边缘提取（Sobel，要遍历约 80 万像素）放到开播之后再做，
          // 否则那段时间屏幕是空的，看起来就是"开机自启动好慢"。
          heroRect = boxAt(W, H, img.naturalWidth, img.naturalHeight);
          start();
          later(finish, T.endAt);
          later(stop, T.hardMax);
          setTimeout(function () {
            if (done) return;
            var t0e = performance.now();
            try {
              buildEdges(img);
              window.__dshNaiwaTiming = {
                imgToStart: Math.round(t0e - tLoad),
                buildEdges: Math.round(performance.now() - t0e)
              };
            } catch (err) {
              console.warn('[dsh-naiwa-entrance] 线条层构建失败（其余动画不受影响）：', err);
            }
          }, 0);
        } catch (err) {
          window.__dshNaiwaDiag = '启动失败: ' + err.message;
          console.warn('[dsh-naiwa-entrance] 启动失败：', err);
          stop();
        }
      };
      img.onerror = function () {
        window.__dshNaiwaDiag = 'img.onerror ' + ASSET;
        console.warn('[dsh-naiwa-entrance] 素材加载失败：' + ASSET);
        if (window.__dshNaiwaSetStatus) window.__dshNaiwaSetStatus('素材加载失败：' + ASSET, true);
        stop();
      };
      img.src = ASSET;

      return function dispose() {
        window.removeEventListener('keydown', onKey);
        stop();
      };
    }


  window.__dshNaiwaBootRan = true;
  if (window.__dshNaiwaPlaying) return;
  try { playInner(); } catch (e) { console.warn('[dsh-naiwa-entrance] 开机注入播放失败：', e); }
})();
