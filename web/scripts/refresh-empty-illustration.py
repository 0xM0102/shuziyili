#!/usr/bin/env python3
"""从透明 PNG 生成 `public/illustrations/empty-content.webp`（保留 Alpha）。"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
# 源图放 assets，勿提交 public 下的大 PNG
SRC = ROOT / "assets/illustrations/empty-content.source.png"
OUT = ROOT / "public/illustrations/empty-content.webp"
MAX_WIDTH = 960


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(
            f"缺少源文件：{SRC}\n"
            "请将透明 PNG 放到该路径后重新运行 npm run illustrations:empty"
        )
    img = Image.open(SRC).convert("RGBA")
    if img.width > MAX_WIDTH:
        h = int(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, h), Image.Resampling.LANCZOS)
    img.save(OUT, "WEBP", quality=86, method=6, lossless=False)
    print(f"已写入 {OUT} ({OUT.stat().st_size} bytes, {img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
