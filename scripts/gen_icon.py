#!/usr/bin/env python3
"""生成 slot game 風格 app icon（1024x1024 PNG）"""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SIZE = 1024
OUT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'build', 'appicon.png'))

def gradient_bg(size: int) -> Image.Image:
    img = Image.new('RGBA', (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        r = int(13 + 13 * t)
        g = int(13 - 3 * t)
        b = int(26 + 20 * t)
        draw.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    return img

def draw_gold_border(draw: ImageDraw.ImageDraw, size: int) -> None:
    margin, radius = 56, 110
    for i in range(6):
        alpha = int(255 - i * 38)
        draw.rounded_rectangle(
            [margin + i, margin + i, size - margin - i, size - margin - i],
            radius=radius,
            outline=(255, 200, 50, alpha),
            width=1,
        )

def find_font(size: int):
    candidates = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/Library/Fonts/Arial Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def draw_seven_glow(img: Image.Image, font) -> Image.Image:
    text = '7'
    tmp = ImageDraw.Draw(img)
    bbox = font.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (SIZE - tw) // 2 - bbox[0]
    ty = (SIZE - th) // 2 - bbox[1] - 40

    glow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for alpha in [60, 100, 150]:
        gd.text((tx, ty), text, fill=(255, 200, 50, alpha), font=font)
    glow = glow.filter(ImageFilter.GaussianBlur(radius=22))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    d.text((tx, ty), text, fill=(255, 215, 0, 255), font=font)
    d.text((tx - 5, ty - 5), text, fill=(255, 255, 220, 80), font=font)
    return img

def draw_stars(draw: ImageDraw.ImageDraw) -> None:
    for cx, cy, base_r in [(175, 175, 14), (245, 135, 10), (135, 245, 10)]:
        for r in range(base_r, 0, -3):
            alpha = int(220 * r / base_r)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                         fill=(255, 215, 50, alpha))

def main():
    img = gradient_bg(SIZE)
    draw = ImageDraw.Draw(img)
    draw_gold_border(draw, SIZE)
    draw_stars(draw)
    font = find_font(600)
    img = draw_seven_glow(img, font)
    bg = Image.new('RGB', (SIZE, SIZE), (13, 13, 26))
    bg.paste(img, mask=img.split()[3])
    bg.save(OUT)
    print(f'Icon saved → {OUT}')

if __name__ == '__main__':
    main()
