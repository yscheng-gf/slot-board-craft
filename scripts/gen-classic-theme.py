#!/usr/bin/env python3
"""Generate 29 classic fruit-machine symbols with Pillow.

Run from any directory: python3 /path/to/scripts/gen-classic-theme.py
Requires Pillow. Draw at 4x resolution and downsample to transparent 128px PNGs.
Only the named assets are written; existing unrelated files are left alone.
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "frontend/src/assets/images/themes/classic"
SIZE, SCALE = 128, 4
INK, CREAM = "#452619", "#fff5ce"
GOLD = ("#fff3a1", "#efb62e", "#ac5919")
RED = ("#ff9580", "#eb343e", "#961c35")
GREEN = ("#c1e970", "#4da04c", "#226342")
PURPLE = ("#d7a6f3", "#8753b9", "#492859")
BLUE = ("#d4ffff", "#50c7dc", "#2763a3")
FONT_PATHS = (
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    "DejaVuSans-Bold.ttf",
)


def coords(value):
    if isinstance(value, (list, tuple)):
        return [coords(item) for item in value]
    return round(value * SCALE)


def rgb(color):
    return tuple(bytes.fromhex(color.lstrip("#")))


class Symbol:
    def __init__(self):
        self.image = Image.new("RGBA", (SIZE * SCALE,) * 2)

    def shape(self, kind, points, colors, width=2.2, outline=INK, **kwargs):
        """Fill a shape with a three-stop enamel gradient and a crisp outline."""
        mask = Image.new("L", self.image.size)
        method = getattr(ImageDraw.Draw(mask), kind)
        method(coords(points), fill=255, **{k: coords(v) for k, v in kwargs.items()})
        bounds = mask.getbbox()
        if bounds is None:
            return
        gradient = Image.new("RGBA", self.image.size)
        draw = ImageDraw.Draw(gradient)
        stops = [rgb(c) for c in colors]
        top, bottom = bounds[1], bounds[3]
        for y in range(top, bottom):
            t = (y - top) / max(1, bottom - top - 1) * (len(stops) - 1)
            index = min(int(t), len(stops) - 2)
            mix = t - index
            color = tuple(round(a + (b - a) * mix) for a, b in zip(stops[index], stops[index + 1]))
            draw.line((0, y, SIZE * SCALE, y), fill=(*color, 255))
        self.image.alpha_composite(Image.composite(gradient, Image.new("RGBA", self.image.size), mask))
        if outline and width:
            getattr(ImageDraw.Draw(self.image), kind)(
                coords(points), outline=outline, width=coords(width),
                **{k: coords(v) for k, v in kwargs.items()}
            )

    def ellipse(self, box, colors=GOLD, **kwargs):
        self.shape("ellipse", box, colors, **kwargs)

    def poly(self, points, colors=GOLD, **kwargs):
        self.shape("polygon", points, colors, **kwargs)

    def rect(self, box, colors=GOLD, radius=6, **kwargs):
        self.shape("rounded_rectangle", box, colors, radius=radius, **kwargs)

    def line(self, points, fill=CREAM, width=2):
        ImageDraw.Draw(self.image).line(coords(points), fill=fill, width=coords(width), joint="curve")

    def arc(self, box, start, end, fill=CREAM, width=2):
        ImageDraw.Draw(self.image).arc(coords(box), start, end, fill=fill, width=coords(width))

    def text(self, text, box, fill=CREAM, stroke=INK, width=1.3):
        # Find a portable bold font; never silently substitute tiny bitmap text.
        for path in FONT_PATHS:
            try:
                font = ImageFont.truetype(path, 64 * SCALE)
                break
            except OSError:
                continue
        else:
            raise RuntimeError("Install DejaVu Sans Bold or edit FONT_PATHS to a bold TrueType font.")
        bbox = font.getbbox(text, stroke_width=coords(width))
        layer = Image.new("RGBA", (bbox[2] - bbox[0] + 8, bbox[3] - bbox[1] + 8))
        ImageDraw.Draw(layer).text((4 - bbox[0], 4 - bbox[1]), text, font=font, fill=fill,
                                  stroke_width=coords(width), stroke_fill=stroke)
        x0, y0, x1, y1 = coords(box)
        factor = min((x1 - x0) / layer.width, (y1 - y0) / layer.height)
        layer = layer.resize((max(1, round(layer.width * factor)), max(1, round(layer.height * factor))), Image.Resampling.LANCZOS)
        self.image.alpha_composite(layer, ((x0 + x1 - layer.width) // 2, (y0 + y1 - layer.height) // 2))

    def sparkle(self, x, y, r=7):
        self.poly([(x, y-r), (x+2, y-2), (x+r, y), (x+2, y+2),
                   (x, y+r), (x-2, y+2), (x-r, y), (x-2, y-2)],
                  (CREAM, "#ffe8a0"), width=0)

    def finish(self):
        # A small warm drop shadow remains transparent outside the silhouette.
        alpha = self.image.getchannel("A")
        shadow = Image.new("RGBA", self.image.size, (56, 24, 15, 0))
        shifted = Image.new("L", self.image.size)
        shifted.paste(alpha, (0, 2 * SCALE))
        shadow.putalpha(shifted.filter(ImageFilter.GaussianBlur(1.1 * SCALE)).point(lambda a: a // 3))
        shadow.alpha_composite(self.image)
        return shadow.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def star(s, x=64, y=61, radius=49, colors=GOLD):
    points = []
    for i in range(10):
        angle = -math.pi / 2 + i * math.pi / 5
        r = radius if i % 2 == 0 else radius * .47
        points.append((x + math.cos(angle)*r, y + math.sin(angle)*r))
    s.poly(points, colors)
    s.line([points[8], points[9], points[0], points[1]], width=1.8)


def leaf(s, x, y, scale=1):
    s.poly([(x, y), (x+4*scale, y-15*scale), (x+24*scale, y-17*scale),
            (x+18*scale, y-3*scale)], GREEN, width=1.6)
    s.line([(x+3*scale, y-2*scale), (x+18*scale, y-12*scale)], "#d9ec9e", 1)


def medal(s, colors=GOLD):
    s.ellipse((12, 12, 116, 116), GOLD)
    s.ellipse((19, 19, 109, 109), colors, width=1.5)
    s.arc((24, 24, 104, 104), 195, 285, width=2)
    for i in range(20):
        a = i * math.tau / 20
        x, y = 64 + 48*math.cos(a), 64 + 48*math.sin(a)
        s.ellipse((x-1, y-1, x+1, y+1), (CREAM, CREAM), width=0)


def banner(s, label, y=73, colors=RED):
    s.poly([(8, y+4), (25, y+4), (25, y+31), (8, y+31), (14, y+18)], colors)
    s.poly([(103, y+4), (120, y+4), (114, y+18), (120, y+31), (103, y+31)], colors)
    s.rect((18, y, 110, y+30), colors, radius=4)
    s.text(label, (23, y+7, 105, y+23), width=1)


def build_theme():
    images = {}

    def add(name, s):
        images[name] = s.finish()

    # High symbols: 777, BAR, bell, diamond, star, crown, horseshoe, clover, gold.
    s = Symbol()
    s.rect((10, 27, 118, 99), GOLD, radius=12)
    s.rect((15, 32, 113, 94), ("#fff9e2", "#f4deb0"), radius=9, width=1)
    s.text("777", (19, 41, 109, 85), fill="#c82938", stroke="#782635", width=1)
    s.sparkle(109, 23, 9)
    add("high-1", s)

    s = Symbol()
    s.rect((10, 30, 118, 99), GOLD, radius=10)
    s.rect((16, 36, 112, 93), ("#67413b", "#241e28"), radius=6)
    s.line([(23, 44), (105, 44)], "#e8bd64", 2)
    s.line([(23, 85), (105, 85)], "#e8bd64", 2)
    s.text("BAR", (24, 49, 104, 80))
    add("high-2", s)

    s = Symbol()
    s.ellipse((55, 14, 73, 32))
    s.ellipse((53, 94, 75, 114))
    s.poly([(23, 91), (32, 78), (36, 48), (42, 33), (54, 26), (74, 26),
            (86, 33), (92, 48), (96, 78), (105, 91)])
    s.rect((19, 87, 109, 101), GOLD, radius=6)
    s.line([(43, 74), (46, 47), (52, 38)], width=4)
    add("high-3", s)

    s = Symbol()
    s.poly([(31, 25), (94, 25), (114, 50), (64, 111), (14, 50)], BLUE)
    for points, color in [([(31,25),(49,25),(40,50),(14,50)], "#b6f6fc"),
                          ([(49,25),(79,25),(88,50),(40,50)], "#e2ffff"),
                          ([(14,50),(40,50),(64,111)], "#4cabc8"),
                          ([(40,50),(88,50),(64,111)], "#8ae9ef"),
                          ([(88,50),(114,50),(64,111)], "#3377ad")]:
        s.poly(points, (color, color), width=1.2)
    s.line([(14,50),(114,50)], "#e4ffff", 1.5)
    s.sparkle(99, 25, 10)
    add("high-4", s)

    s = Symbol()
    star(s)
    star(s, radius=32, colors=("#fff8be", "#f5cd52", "#d58a24"))
    add("high-5", s)

    s = Symbol()
    s.poly([(22,86),(15,35),(43,53),(64,23),(85,53),(113,35),(106,86)])
    s.rect((23, 83, 105, 105), GOLD, radius=4)
    for x, y in [(15,33),(64,21),(113,33)]:
        s.ellipse((x-5,y-5,x+5,y+5), RED, width=1.5)
    for x in (40,64,88):
        s.ellipse((x-5,89,x+5,99), RED if x == 64 else BLUE, width=1.3)
    s.line([(29,77),(26,55),(44,66),(64,39)], width=2)
    add("high-6", s)

    s = Symbol()
    # Open U silhouette formed by a continuous polygon; transparent center.
    s.poly([(20,21),(43,21),(43,71),(47,83),(57,90),(71,90),(81,83),(85,71),
            (85,21),(108,21),(108,73),(103,94),(88,109),(64,115),(40,109),(25,94),(20,73)])
    s.line([(27,28),(27,72),(32,91),(45,103),(64,108),(83,103),(96,91),(101,72),(101,28)], width=2)
    for x, y in [(32,40),(32,62),(39,86),(96,40),(96,62),(89,86)]:
        s.rect((x-3,y-4,x+3,y+4), ("#8e581f", "#6a3c1c"), radius=1, width=0)
    add("high-7", s)

    s = Symbol()
    s.line([(64,65),(69,95),(91,110)], "#245938", 7)
    for box in [(24,19,66,66),(62,19,104,66),(24,59,66,106),(62,59,104,106)]:
        s.ellipse(box, GREEN)
    for end in [(43,40),(85,40),(43,84),(85,84)]:
        s.line([(64,63),end], "#b8df7b", 2)
    s.ellipse((57,56,71,70), GREEN, width=1)
    add("high-8", s)

    s = Symbol()
    for dx, dy in [(0,15),(-9,-4),(20,-13)]:
        s.poly([(27+dx,58+dy),(73+dx,58+dy),(89+dx,82+dy),(17+dx,82+dy)])
        s.poly([(27+dx,58+dy),(73+dx,58+dy),(80+dx,69+dy),(22+dx,69+dy)], ("#fff5b4", "#f6cd59"), width=1)
    s.sparkle(99,37,9)
    add("high-9", s)

    # Low symbols: cherries, lemon, orange, plums, grapes, melon, pineapple,
    # strawberry, apple, bananas.
    s = Symbol()
    s.line([(37,63),(47,37),(72,21),(83,65)], "#405f32", 4)
    leaf(s, 68, 28)
    for box in [(13,57,65,110),(63,62,115,115)]:
        s.ellipse(box, RED)
        x,y,_,_ = box
        s.arc((x+9,y+8,x+35,y+34), 195, 275, width=4)
    add("low-11", s)

    s = Symbol()
    leaf(s,72,35)
    s.poly([(13,70),(23,51),(42,39),(76,38),(99,50),(116,73),(105,89),
            (87,101),(52,104),(29,93),(20,80)], ("#fff5a2", "#f5d243", "#cc9226"))
    s.arc((29,47,94,91), 190, 280, width=4)
    add("low-12", s)

    s = Symbol()
    s.ellipse((20,33,108,115), ("#ffd686", "#f6972f", "#c65b24"))
    s.line([(63,36),(66,20)], "#78522b", 5)
    leaf(s,66,31)
    s.arc((31,43,88,97), 185, 265, width=4)
    for x,y in [(86,79),(91,67),(81,91),(73,99),(94,86)]:
        s.ellipse((x,y,x+1.5,y+1.5), ("#d57728", "#d57728"), width=0)
    add("low-13", s)

    s = Symbol()
    s.line([(49,43),(65,22),(84,43)], "#6a502c", 4)
    leaf(s,64,27)
    s.ellipse((19,38,73,108), PURPLE)
    s.ellipse((61,42,111,114), ("#a69bda", "#61518d", "#352846"))
    s.arc((29,48,60,94), 190, 270, width=3)
    s.arc((71,52,100,99), 190, 270, width=3)
    add("low-14", s)

    s = Symbol()
    s.line([(65,40),(70,19)], "#71502c", 5)
    leaf(s,68,30,1.2)
    for x,y in [(44,43),(73,43),(30,65),(58,66),(87,65),(44,86),(73,86),(59,105)]:
        s.ellipse((x-14,y-14,x+14,y+14), PURPLE, width=1.7)
        s.arc((x-9,y-9,x+7,y+7), 190, 270, width=1.6)
    add("low-15", s)

    s = Symbol()
    s.poly([(13,45),(115,45),(107,78),(88,103),(64,113),(40,103),(21,78)], GREEN)
    s.poly([(18,46),(110,46),(102,76),(84,97),(64,105),(44,97),(26,76)], (CREAM,"#d9e9a0"), width=0)
    s.poly([(23,47),(105,47),(96,75),(80,91),(64,99),(48,91),(32,75)], RED, width=0)
    for x,y in [(42,60),(65,62),(86,60),(53,79),(76,79)]:
        s.ellipse((x-2,y-4,x+2,y+3), ("#542f2c", "#542f2c"), width=0)
    add("low-16", s)

    s = Symbol()
    s.ellipse((33,43,95,116), GOLD)
    for offset in (-40,-20,0,20,40):
        # Clip the diagonal skin pattern to the fruit's elliptical silhouette.
        mask = Image.new("L", s.image.size)
        ImageDraw.Draw(mask).ellipse(coords((37,47,91,112)), fill=255)
        lines = Image.new("RGBA", s.image.size)
        d = ImageDraw.Draw(lines)
        for sign in (-1,1):
            d.line(coords([(36,60+offset),(92,60+offset+sign*56)]), fill="#bd802c", width=coords(1.4))
        lines.putalpha(Image.composite(lines.getchannel("A"), Image.new("L", lines.size), mask))
        s.image.alpha_composite(lines)
    s.poly([(62,57),(30,25),(52,34),(50,11),(66,32),(80,11),(79,35),(101,26),(79,57)], GREEN)
    s.line([(64,48),(64,30)], "#c1df8a", 2)
    add("low-17", s)

    s = Symbol()
    s.poly([(26,40),(45,30),(83,30),(103,42),(99,68),(86,92),(64,116),
            (42,93),(28,68)], RED)
    for x,y in [(43,53),(63,49),(84,53),(39,69),(58,67),(79,69),(50,84),(71,84),(62,99)]:
        s.ellipse((x-1.4,y-2.6,x+1.4,y+2.6), ("#fff0a0", "#e5b74a"), width=0)
    s.poly([(64,40),(34,47),(45,33),(29,27),(53,28),(65,15),(72,29),(97,26),(84,37),(95,47)], GREEN, width=1.5)
    add("low-18", s)

    s = Symbol()
    s.poly([(64,42),(47,33),(29,36),(19,52),(20,78),(31,101),(49,113),
            (64,108),(79,113),(97,101),(108,78),(109,52),(99,36),(81,33)], RED)
    s.line([(64,43),(65,20),(72,14)], "#79502b", 5)
    leaf(s,69,30)
    s.arc((30,44,61,91), 180, 265, width=4)
    add("low-19", s)

    s = Symbol()
    for dx,dy in [(13,-10),(-3,-2),(-14,8)]:
        s.poly([(26+dx,52+dy),(38+dx,73+dy),(56+dx,83+dy),(75+dx,80+dy),
                (91+dx,61+dy),(100+dx,32+dy),(106+dx,39+dy),(103+dx,77+dy),
                (88+dx,96+dy),(65+dx,105+dy),(43+dx,98+dy),(28+dx,81+dy),(21+dx,59+dy)], GOLD, width=1.8)
        s.line([(36+dx,77+dy),(55+dx,91+dy),(76+dx,91+dy),(90+dx,80+dy)], "#fff0a4", 2)
    s.rect((91,15,107,27), ("#95834a", "#5c502e"), radius=3, width=1.5)
    add("low-20", s)

    s = Symbol()
    star(s, radius=54)
    banner(s, "WILD", y=66)
    add("special-wild", s)

    s = Symbol()
    medal(s, BLUE)
    for x,y in [(44,40),(84,40),(64,65)]:
        star(s,x,y,15)
    banner(s,"SCATTER",y=79,colors=("#688ec6", "#335481", "#263d61"))
    add("special-scatter", s)

    s = Symbol()
    s.rect((26,44,102,106), RED)
    s.rect((20,37,108,57), RED)
    s.rect((56,38,72,106), GOLD, radius=1, width=1)
    s.ellipse((34,17,64,39), GOLD)
    s.ellipse((64,17,94,39), GOLD)
    s.ellipse((57,28,71,43), RED)
    banner(s,"BONUS",y=76)
    add("special-bonus", s)

    s = Symbol()
    medal(s, ("#a1e2c7", "#3b967e", "#225b59"))
    s.text("FREE", (32,30,96,48))
    s.text("SPIN", (28,59,100,87), fill="#fff1a8")
    s.arc((27,27,101,101), 20, 140, width=3)
    s.poly([(30,81),(28,97),(44,95)], GOLD, width=1)
    add("special-freespin", s)

    s = Symbol()
    s.poly([(29,66),(22,29),(46,43),(64,17),(82,43),(106,29),(99,66)])
    s.ellipse((56,39,72,57), RED)
    banner(s,"JACKPOT",y=67)
    s.text("777", (36,102,92,116), fill="#c62a38", width=.8)
    s.sparkle(13,28,6)
    s.sparkle(116,47,6)
    add("special-jackpot", s)

    s = Symbol()
    medal(s)
    s.ellipse((30,30,98,98), ("#f7ce68", "#e7a527", "#c17b1d"), width=1)
    s.text("$", (42,36,86,93), fill="#fff3ba", stroke="#a35b1b", width=2)
    s.sparkle(102,24,8)
    add("special-coin", s)

    s = Symbol()
    medal(s, ("#a1e2c7", "#3b967e", "#225b59"))
    s.arc((32,29,96,91), 205, 505, fill="#ffdf70", width=9)
    s.poly([(26,50),(47,52),(35,69)], GOLD, width=1)
    s.text("RE", (46,49,88,70), width=1)
    s.text("SPIN", (38,93,90,103), width=1)
    add("special-respin", s)

    s = Symbol()
    star(s,radius=55,colors=PURPLE)
    star(s,y=57,radius=35)
    s.text("SUPER", (34,43,94,54), fill="#74345b", stroke=CREAM, width=.7)
    banner(s,"WILD",y=72,colors=PURPLE)
    s.sparkle(108,23,7)
    add("special-superwild", s)

    s = Symbol()
    medal(s, RED)
    s.text("×2", (27,37,101,82), fill="#fff1a7")
    s.text("MULTIPLIER", (28,88,100,99), width=.7)
    add("special-multiplier", s)

    s = Symbol()
    medal(s, PURPLE)
    s.text("?", (43,31,85,96), fill="#fff1a7", width=2)
    s.sparkle(98,27,8)
    add("special-generic", s)
    return images


def main():
    images = build_theme()
    expected = {f"high-{i}" for i in range(1, 10)} | {f"low-{i}" for i in range(11, 21)} | {
        f"special-{name}" for name in (
            "wild", "scatter", "bonus", "freespin", "jackpot", "coin", "respin",
            "superwild", "multiplier", "generic"
        )
    }
    if images.keys() != expected:
        raise ValueError(f"Unexpected asset set: {images.keys() ^ expected}")
    # Validate the entire batch before writing, including margin and antialiasing.
    for name, image in images.items():
        alpha = image.getchannel("A")
        bounds = alpha.getbbox()
        if image.mode != "RGBA" or image.size != (SIZE, SIZE) or not bounds:
            raise ValueError(f"Invalid image: {name}")
        if not (0 < bounds[0] < bounds[2] < SIZE and 0 < bounds[1] < bounds[3] < SIZE):
            raise ValueError(f"Clipped silhouette: {name}: {bounds}")
        if not any(alpha.histogram()[1:255]):
            raise ValueError(f"Missing antialiasing: {name}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, image in images.items():
        path = OUTPUT / f"{name}.png"
        image.save(path, optimize=True)
        print(path.relative_to(Path(__file__).resolve().parents[1]))
    print(f"Generated {len(images)} transparent {SIZE}x{SIZE} PNGs.")


if __name__ == "__main__":
    main()
