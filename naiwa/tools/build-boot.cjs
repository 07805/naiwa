// 从 lib/client.js 抽出「自挂载版本」生成 lib/boot.js。
// 开机 HTML 注入用这个文件：它在页面解析阶段执行，比应用的 bundle 早，
// 所以能做到「一打开软件就显示」。
// 用法：node tools/build-boot.cjs
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'lib', 'client.js'), 'utf8');

const HEAD = 'factory: function (require) {';
const TAIL = "    exports.name = 'dsh-naiwa-entrance';";

const a = src.indexOf(HEAD);
if (a < 0) throw new Error('client.js 里找不到 factory 头');
let inner = src.slice(a + HEAD.length);

const b = inner.indexOf(TAIL);
if (b < 0) throw new Error('client.js 里找不到 exports.name 尾');
inner = inner.slice(0, b);

const out = [
  '// ⚠️ 自动生成，请勿手改 —— 改 lib/client.js 后执行 node tools/build-boot.cjs',
  '(function () {',
  "  'use strict';",
  inner,
  '  window.__dshNaiwaBootRan = true;',
  '  if (window.__dshNaiwaPlaying) return;',
  "  try { playInner(); } catch (e) { console.warn('[dsh-naiwa-entrance] 开机注入播放失败：', e); }",
  '})();',
  '',
].join('\n');

const dest = path.join(root, 'lib', 'boot.js');
fs.writeFileSync(dest, out);
console.log('已生成 lib/boot.js：' + out.length + ' 字符');
