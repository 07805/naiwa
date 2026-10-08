# 安装 / 卸载

> **务必在 DSH 关闭时操作。** profile 是"活"的：运行中写入，界面会立刻尝试加载这个插件。

## 准备

假设插件放在 `D:\dsh\naiwa`（换成你的实际路径），profile 目录是 `D:\dsh\profiles\desktop`。

## 安装（三步）

**1. 建联接**（不复制文件，改插件源码立刻生效）

```powershell
New-Item -ItemType Junction `
  -Path  "D:\dsh\profiles\desktop\node_modules\dsh-naiwa-entrance" `
  -Target "D:\dsh\naiwa"
```

**2. 改 `D:\dsh\profiles\desktop\package.json`**，加两处：

```jsonc
{
  "dependencies": {
    "dsh-whale-widget": "^0.3.17",
    "dsh-naiwa-entrance": "link:D:/dsh/naiwa"        // ← 加这行（注意逗号）
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-whale-widget",
        "@deepseek-ai/dsh-experimental-agent-team-profile",
        "dsh-naiwa-entrance"                          // ← 加这行（注意逗号）
      ]
    }
  }
}
```

**3. 重启 DSH。** 启动时会自动播放一次开场动画，播放完自动消失（界面上不留任何常驻元素）。

## 卸载

**1. 删联接**（只删链接，不动源码）

```powershell
(Get-Item "D:\dsh\profiles\desktop\node_modules\dsh-naiwa-entrance").Delete()
```

**2. 把 `package.json` 里加的两行删掉。**

**3. 重启 DSH。**

## 出问题时的急救

动画只在**页面刚加载**时自动播一次；运行中热加载进来不播。万一播放中出问题：

1. 按 **Esc**、点一下画面、或点右下角「跳过」→ 立即结束
2. 真被卡住：关掉 DSH 重开，再按上面的步骤卸载

代码里有三道保险：点画面即结束、`T.endAt`(4.5s) 自动淡出、`T.hardMax`(6s) 无条件硬撤。

> **排查记录（v1 卡死的真因）**：`stop()` 曾用 `if (done) return` 做守卫，而 `finish()` 会先把 `done = true` 再延迟调用 `stop()` —— 于是 `stop()` 立刻返回，**那层全屏遮罩永远留在页面上**（淡出后是透明的，但照样吃掉所有点击），表现就是"界面卡死"。现已改用独立的 `stopped` 标志，并由运行时冒烟测试守住这条回归。
