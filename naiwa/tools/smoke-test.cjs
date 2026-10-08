// 运行时冒烟测试：Node + 最小 DOM/Canvas 桩。
//   node tools/smoke-test.cjs           正常 rAF
//   node tools/smoke-test.cjs raf-off   rAF 被节流/冻结（窗口未聚焦）下的定时器兜底
const fs = require('fs');
const path = require('path');

const RAF_OFF = process.argv[2] === 'raf-off';
const CLIENT = path.join(__dirname, '..', 'lib', 'client.js');
const warnings = [];
const T0 = 1000;                       // 页面才加载 1 秒 → freshPage = true
const startWall = Date.now();

function Classes() { this.set = new Set(); }
Classes.prototype.add = function (c) { this.set.add(c) };
Classes.prototype.remove = function (c) { this.set.delete(c) };
Classes.prototype.toggle = function (c, on) {
  if (on === undefined) { this.set.has(c) ? this.set.delete(c) : this.set.add(c) }
  else { on ? this.set.add(c) : this.set.delete(c) }
};
Classes.prototype.contains = function (c) { return this.set.has(c) };

function El(tag) {
  this.tagName = tag;
  this.children = [];
  this.style = {};
  this.attrs = {};
  this._l = {};
  this.className = '';
  this.classList = new Classes();
  if (tag === 'canvas') { this.width = 0; this.height = 0; this.getContext = () => ctx2d }
}
El.prototype.appendChild = function (c) { c.parent = this; this.children.push(c); return c };
El.prototype.setAttribute = function (k, v) { this.attrs[k] = v };
El.prototype.getAttribute = function (k) { return this.attrs[k] };
El.prototype.addEventListener = function (t, f) { (this._l[t] = this._l[t] || []).push(f) };
El.prototype.removeEventListener = function (t, f) {
  if (this._l[t]) this._l[t] = this._l[t].filter((x) => x !== f);
};
El.prototype.dispatch = function (t, ev) { (this._l[t] || []).slice().forEach((f) => f(ev || {})) };
El.prototype.remove = function () {
  this.removed = true;
  if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this);
};
El.prototype.querySelector = function (sel) { return (this._q || {})[sel] || null };
El.prototype.querySelectorAll = function () { return [new El('h1'), new El('h2'), new El('i'), new El('h3')] };
El.prototype.insertAdjacentHTML = function () {};

Object.defineProperty(El.prototype, 'innerHTML', {
  set() {
    this._q = {};
    for (const n of ['naiwa-canvas', 'naiwa-copy', 'naiwa-skip']) {
      const kid = n.includes('canvas') ? new El('canvas') : (n.includes('skip') ? new El('button') : new El('div'));
      kid.id = n;                       // 必须有 id，否则按 id 找不到元素
      kid.parent = this; this.children.push(kid); this._q['#' + n] = kid;
    }
  },
  get() { return '' },
});

const gradient = { addColorStop() {} };
const ctx2d = new Proxy({}, {
  get(t, k) {
    if (k === 'canvas') return { width: 1256, height: 628 };
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => gradient;
    if (k === 'getImageData') return (x, y, w, h) => {
      // 真浏览器对非有限尺寸会抛 IndexSizeError；桩必须同样严格
      if (![x, y, w, h].every((n) => Number.isFinite(n)) || w <= 0 || h <= 0) {
        throw new Error('getImageData 参数非法: ' + [x, y, w, h].join(','));
      }
      return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
    };
    if (k === 'putImageData') return () => {};
    if (k in t) return t[k];
    return () => {};
  },
  set(t, k, v) { t[k] = v; return true },
});

const body = new El('body');
const head = new El('head');
const document = {
  head, body,
  createElement: (t) => new El(t),
  getElementById: (id) => body.children.find((c) => c.id === id) || null,
  querySelector: (sel) => (/textarea|contenteditable/.test(sel) ? {} : null),
  querySelectorAll: () => [],
  addEventListener() {},
};

class ImageDataStub { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4) } }
class ImageStub {
  constructor() { this.naturalWidth = 1200; this.naturalHeight = 1157 }
  set src(v) { this._src = v; setTimeout(() => { if (this.onload) this.onload() }, 5) }
  get src() { return this._src }
}

const globalListeners = {};
const win = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener(t, f) { (globalListeners[t] = globalListeners[t] || []).push(f) },
  removeEventListener(t, f) {
    if (globalListeners[t]) globalListeners[t] = globalListeners[t].filter((x) => x !== f);
  },
  __ModuleLoader__: { load(m) { win.__m = m } },
};

global.window = win;
global.document = document;
global.performance = { now: () => T0 + (Date.now() - startWall) };
global.Image = ImageStub;
global.ImageData = ImageDataStub;
const realWarn = console.warn;
console.warn = (...a) => { warnings.push(a.join(' ')); realWarn('  [warn]', ...a) };

const rafImpl = RAF_OFF
  ? function () { return 0 }                          // 模拟 rAF 被冻结
  : function (fn) { return setTimeout(() => fn(performance.now()), 16) };

new Function('window', 'document', 'Image', 'ImageData', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'console',
  fs.readFileSync(CLIENT, 'utf8'))
  (win, document, ImageStub, ImageDataStub, rafImpl, function () {}, global.performance, console);

console.log('模式:', RAF_OFF ? 'rAF 冻结（靠定时器兜底）' : '正常 rAF');
const mod = win.__m.factory(function () { return {} });
mod.apply({ effect: function () {}, get: function () { return undefined } });
const hasBtn = !!document.getElementById('naiwa-entrance-btn');
console.log('  apply() 后：手动按钮已移除 =', !hasBtn, '(应为 true)');
if (hasBtn) { console.log('FAIL: 左下角按钮还在'); process.exit(1) }

function textSeen() {
  var found = false;
  (function walk(el) {
    if (!el || found) return;
    if (el.id === 'naiwa-copy' && el.classList.contains('dshle-on')) { found = true; return }
    (el.children || []).forEach(walk);
  })(body);
  return found;
}

setTimeout(function () {
  const r = document.getElementById('naiwa-entrance-root');
  const cvs = r && r.querySelector('#naiwa-canvas');
  const init = win.__dshNaiwaInit || {};
  console.log('  t≈0.6s：已播出 =', !!r, '｜画布 =', cvs ? cvs.width + 'x' + cvs.height : 'none',
    '｜粒子 =', init.parts, '｜甲片 =', init.plates);
  if (!r) { console.log('FAIL: 没有播放'); process.exit(1) }
  if (!cvs || !cvs.width) { console.log('FAIL: 画布尺寸为 0（resize 未调用）'); process.exit(1) }
  if (!init.parts || !init.plates) {
    console.log('FAIL: 粒子/甲片未初始化（buildParticles/buildPlates 没在启动时调用）');
    process.exit(1);
  }
}, 600);

var sawText = false;
setTimeout(function () {
  // 文案在 t≥2250ms 才出现；此时遮罩仍在，检查它是否真被加上
  sawText = textSeen();
  const r = document.getElementById('naiwa-entrance-root');
  console.log('  t≈2.8s：动画推进到文案阶段 =', sawText, '｜遮罩仍在 =', !!r);
}, 2800);

setTimeout(function () {
  const inBody = body.children.some(function (c) { return c && c.id === 'naiwa-entrance-root' });
  console.log('  t≈5.6s：遮罩已收干净 =', !inBody, '｜告警数 =', warnings.length);
  const ok = !inBody && warnings.length === 0 && sawText;
  console.log(ok ? '\n冒烟测试通过' + (RAF_OFF ? '（rAF 冻结下动画仍完整播完 ✅）' : '') : '\n冒烟测试失败');
  process.exit(ok ? 0 : 1);
}, 5600);
