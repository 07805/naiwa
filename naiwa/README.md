# dsh-naiwa-entrance

奶蛙**变身动画**（[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件）：帝皇法阵 → 金色线条勾出轮廓 → 甲片旋转飞入合体 → 金色爆闪 → 出图。

> **v3 起把 v1 的致命设计去掉了。** v1 是"全屏 + 劫持所有输入 + 播完不删除"，三者叠加就是**界面卡死**：
> `finish()` 先把 `done` 置真，再调 `stop()`；而 `stop()` 用 `done` 做守卫 → 直接返回 → **那层透明全屏遮罩永远留在页面上，吃掉你所有的点击**。
> 现在：只在页面刚加载时自动播；**不劫持任何输入**；点一下/`Esc`/跳过立即结束；6 秒无条件硬撤。

## 用法

- **一打开软件就出现**（见下方「开机注入」），播放中：**点画面任意处 / 按 `Esc` / 点「跳过」** → 立即结束
- 不 `preventDefault`、不 `stopImmediatePropagation`、不拦键盘（键盘只监听 `Esc`）
- 无任何常驻 UI（没有按钮、没有角标）
- 三道收尾保险：点画面即结束、`T.endAt`(4.5s) 自动淡出、`T.hardMax`(6s) 无条件硬撤
- 失败时左下角会短暂显示一行原因（12 秒后消失），平时完全看不见

## 开机注入：为什么能做到「一打开就显示」

只靠客户端插件是做不到的——它必须等 DSH 把几十个 bundle 加载完、激活插件之后才会跑，那时界面早就出来了。

所以宿主半边会往**开机 HTML** 里注入内容（`webserver/index-inject` 事件，官方支持的钩子）：

```js
webCtx.on('webserver/index-inject', (table) => {
  table.push({ kind: 'html',       placement: 'head', html: '<link rel="preload" as="image" href="…/hero.png">' })
  table.push({ kind: 'script-src', placement: 'body', src: '/dsh-naiwa-entrance/boot.js' })
})
```

- 注入位置在 `<body>` 开始处，而应用入口是 `type="module"`（默认 defer）
- ⟹ 开场动画**先于整个应用执行**，浏览器一解析就画，不用等任何 bundle

`lib/boot.js` 是 `lib/client.js` 的**自挂载版本，自动生成**：

```bash
node tools/build-boot.cjs     # 改完 lib/client.js 后必须执行
```

`lib/client.js` 仍随应用加载，作为兜底：它检测到 `__dshNaiwaBootRan` 就让位，**不会播第二遍**。

## 效果时间轴

| 时间 | 画面 |
| --- | --- |
| 0.1–0.7s | 帝皇法阵亮起（同心环 + 36 根放射刻度，缓慢旋转） |
| 0.25–1.4s | **金色线条勾出角色轮廓**（此时还没有图片） |
| 0.7–2.1s | **14 块甲片旋转飞入**，依次锁定，锁定时各爆一圈亮环 |
| ~2.13s | 全部就位 → **金色爆闪 + 20 道放射光** |
| 2.06–2.26s | **图片在爆闪中显现** |
| 2.25s+ | 文案浮现；随后整层淡出 |

两道保险：`T.endAt`（4.5s）自动淡出；`T.hardMax`（6s）硬撤，无论发生什么都会收掉这层。

## 安装

见 [INSTALL.md](INSTALL.md)。要点：**在 DSH 关闭时**改 profile，然后启动。

## 换图

替换 `lib/assets/hero.png` 即可，代码会自动重新提取线条。注意：

- **抠图（透明底）**：左/右/下若被硬切，先用 `tools/feather.py` 做边缘羽化，否则被裁切的边缘会露出硬直线
- **动漫 / 平涂插画**：轮廓与五官线条清晰，效果最好
- **写实照片**：边缘偏碎，把 `lib/client.js` 里的 `C.dens` 调小更干净

```bash
python tools/feather.py 原图.png lib/assets/hero.png 140
```

## 配置

改 `lib/client.js` 顶部的 `T`（时间轴）与 `C`（画面参数）：

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `T.endAt` | `4500` | 动画总长，之后自动淡出 |
| `T.hardMax` | `8000` | 硬撤兜底（毫秒） |
| `T.plateStart` / `plateDur` | `700` / `950` | 甲片飞入的起始时刻与时长 |
| `T.shockAt` | `2130` | 合体完成后的爆闪时刻 |
| `T.fillStart` / `fillEnd` | `2060` / `2260` | 图片显现的时间窗（必须晚于甲片就位） |
| `C.scale` | `0.74` | 角色占画面高度的比例 |
| `C.charCx` | `0.66` | 角色中心的横向位置（0.5 = 正中） |
| `C.dens` | `8` | 线条密度百分比 |

按钮的位置与样式在 `CSS` 里的 `#naiwa-entrance-btn` 一段。

## 开发 / 自测

```bash
node tools/build-boot.cjs            # 改完 client.js 后：重新生成开机脚本 lib/boot.js
node tools/smoke-test.cjs            # 正常 rAF
node tools/smoke-test.cjs raf-off    # rAF 被节流/冻结（窗口未聚焦）下的兜底
```

断言：**无常驻按钮** → 能播 → **画布尺寸非 0** → 动画推进到文案阶段 → 6 秒内收干净 → 全程 0 异常。
（桩对非法的 `getImageData` 尺寸会抛错，与真实浏览器行为一致。）

> **踩过的坑（均已修）**：
> 1. `stop()` 曾用 `if (done) return` 做守卫，而 `finish()` 会先把 `done` 置真再调 `stop()` → 遮罩永远删不掉，界面卡死。
> 2. 从网页版重构成插件时漏掉了 `resize()` 调用 → `W/H` 为 0、画布尺寸 0 → `H/W = NaN` → `getImageData` 抛 `IndexSizeError` → 被 catch 吞掉，表现为"点了没反应"。
> 3. 动画只由 `requestAnimationFrame` 驱动。窗口未聚焦 / 尚未完成首次渲染时 rAF 会被节流甚至暂停 → 动画卡在早期某一帧（只画到金色线条，没有角色、甲片、文案），看起来就是"东西少了"。现已加**定时器兜底**（rAF 超过 120ms 未推进就按墙钟补帧）。

## 许可

**代码 MIT**，见 [LICENSE](LICENSE)。

**`lib/assets/hero.png` 不在 MIT 范围内**，本仓库不授予该素材的任何权利。fork 或再分发时请替换成你自己有权处置的图片。
