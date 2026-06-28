#!/usr/bin/env python3
"""从天气图标合图裁剪、去底并压缩为 WebP（输出到 public/images/weather）。"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = ROOT.parent / ".cursor" / "projects" / "Users-mang-Documents-GanSa-Project-shuziyili" / "assets" / "tianqi-993c9f86-3381-4790-b2d9-d62153ec3d96.png"
OUT_DIR = ROOT / "public" / "images" / "weather"

KEYS = [
    "sunny",
    "partly-cloudy",
    "cloudy",
    "overcast",
    "rain-overcast",
    "rain-light",
    "rain",
    "rain-heavy",
    "thunderstorm",
    "snow-light",
    "snow-heavy",
    "windy",
    "breeze",
    "fog",
    "partly-cloudy-night",
    "rain-night",
    "snow-night",
    "fog-night",
    "tornado",
    "rainbow",
]


def remove_bg(im: Image.Image) -> Image.Image:
    data = im.getdata()
    out = []
    for r, g, b, a in data:
        if r > 245 and g > 245 and b > 245:
            out.append((r, g, b, 0))
        elif max(r, g, b) - min(r, g, b) < 8 and min(r, g, b) > 235:
            out.append((r, g, b, 0))
        else:
            out.append((r, g, b, a))
    im.putdata(out)
    return im


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def main(src: Path = DEFAULT_SRC) -> None:
    if not src.is_file():
        raise SystemExit(f"源图不存在: {src}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.open(src).convert("RGBA")
    cols, rows = 5, 4
    cell_w = img.width // cols
    cell_h = img.height // rows
    margin = 10
    max_dim = 128

    for i, key in enumerate(KEYS):
        row, col = divmod(i, cols)
        x0 = col * cell_w + margin
        y0 = row * cell_h + margin
        x1 = (col + 1) * cell_w - margin
        y1 = (row + 1) * cell_h - margin
        tile = img.crop((x0, y0, x1, y1))
        tile = remove_bg(tile)
        tile = trim_alpha(tile)
        w, h = tile.size
        scale = max_dim / max(w, h)
        if scale < 1:
            tile = tile.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        out_path = OUT_DIR / f"{key}.webp"
        tile.save(out_path, "WEBP", quality=82, method=6)
        print(f"{key}: {tile.size} -> {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    import sys

    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    main(src)
