"""边缘羽化工具：给抠图素材的左/右/下边缘做 alpha 渐隐。

被硬切过的透明底素材，边缘会形成一条直线；直接放进动画里，
这条直线会被边缘检测描出来，变成难看的直边框。
先用本脚本处理一遍即可自然淡出（深色底和浅色底都适用）。

用法：
    python tools/feather.py 原图.png lib/assets/hero.png [羽化宽度]

依赖：pillow、numpy
"""
import sys

import numpy as np
from PIL import Image


def feather(src: str, dst: str, width: int = 140) -> None:
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    alpha = a[..., 3]
    h, w = alpha.shape
    width = max(1, min(width, w // 2, h // 2))

    ramp = np.ones((h, w), np.float32)
    ramp[:, :width] *= np.linspace(0.0, 1.0, width, dtype=np.float32)[None, :]
    ramp[:, w - width:] *= np.linspace(1.0, 0.0, width, dtype=np.float32)[None, :]
    ramp[h - width:, :] *= np.linspace(1.0, 0.0, width, dtype=np.float32)[:, None]
    a[..., 3] = alpha * ramp

    Image.fromarray(a.astype(np.uint8)).save(dst, "PNG", optimize=True)
    print(f"{w}x{h} -> {dst}（羽化 {width}px）")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    feather(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 140)
