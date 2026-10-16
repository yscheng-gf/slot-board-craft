#!/usr/bin/env python3
"""Generate the example pixel theme. Run: python3 scripts/gen-pixel-theme.py.

Each character in a sprite is exactly one pixel; dots are transparent.
Sprites are centered on a 16x16 RGBA canvas, with no resampling or antialiasing.
All palettes share a dark outline and use at most six opaque colors.
Only the 29 named PNGs are written; no other assets are removed or changed.
"""

from pathlib import Path

from PIL import Image, ImageDraw


OUTPUT = Path(__file__).resolve().parents[1] / "frontend/src/assets/images/themes/pixel"
INK = "#252238"
WHITE = "#fff4db"
GOLD = {"o": INK, "s": "#a85b22", "m": "#edab28", "h": "#ffe477", "w": WHITE}
RED = {"o": INK, "s": "#a52c43", "m": "#ed4b55", "h": "#ff9a86", "w": WHITE}
PURPLE = {"o": INK, "s": "#613474", "m": "#9a55c5", "h": "#d79bea", "g": "#5eae62"}


def sprite(rows, palette):
    rows = rows.strip("\n").splitlines()
    width = max(map(len, rows))
    assert width <= 14 and len(rows) <= 14
    image = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    dx, dy = (16 - width) // 2, (16 - len(rows)) // 2
    for y, row in enumerate(rows):
        for x, key in enumerate(row):
            if key != ".":
                image.putpixel((dx + x, dy + y), (*bytes.fromhex(palette[key][1:]), 255))
    return image


FONT = {
    "A": ["010", "101", "111", "101", "101"],
    "B": ["110", "101", "110", "101", "110"],
    "R": ["110", "101", "110", "101", "101"],
    "K": ["101", "101", "110", "101", "101"],
    "Q": ["010", "101", "101", "111", "011"],
    "J": ["111", "001", "001", "101", "010"],
    "1": ["010", "110", "010", "010", "111"],
    "0": ["111", "101", "101", "101", "111"],
    "2": ["110", "001", "010", "100", "111"],
    "W": ["101", "101", "101", "111", "101"],
    "I": ["1", "1", "1", "1", "1"],
    "L": ["100", "100", "100", "100", "111"],
    "D": ["110", "101", "101", "101", "110"],
    "F": ["111", "100", "110", "100", "100"],
    "S": ["111", "100", "111", "001", "111"],
}


def lettering(image, text, x, y, colors, gap=1):
    draw = ImageDraw.Draw(image)
    cursor = x
    for index, char in enumerate(text):
        for py, row in enumerate(FONT[char]):
            for px, bit in enumerate(row):
                if bit == "1":
                    draw.point((cursor + px, y + py), fill=colors[index % len(colors)])
        cursor += len(FONT[char][0]) + gap


def card(rank):
    image = sprite("""
.oooooooooo.
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwwwo
owwwwwwwwswo
owwwwwwwssso
owwwwwwwwswo
.oooooooooo.
""", {"o": INK, "w": WHITE, "s": "#c9bca5"})
    lettering(image, rank, 4 if len(rank) == 2 else 6, 4, [INK])
    return image


def build_theme():
    images = {}

    def add(name, rows, palette):
        images[name] = sprite(rows, palette)

    add("high-1", """
.oooooooooooo.
ohhhhhhhhhhmo.
ommmmmmmmmso.
.ooooooomso..
......omso...
.....omso....
....omso.....
...omso......
...omso......
..omso.......
..omso.......
..omso.......
..oooo.......
""", RED)
    bar = sprite("""
.oooooooooooo.
owwwwwwwwwwwwo
ommmmmmmmmmmmo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
ommmmmmmmmmmmo
owwwwwwwwwwwwo
.oooooooooooo.
""", RED)
    lettering(bar, "BAR", 2, 5, [INK])
    images["high-2"] = bar
    add("high-3", """
.....oooo.....
.....ohmo.....
....oooooo....
...ohhhhsmo...
..ohhmmmmsmo..
..ohmmmmmsmo..
..ohmmmmmsmo..
..ohmmmmmsmo..
.ohmmmmmmsmmo.
ohhhhhhhhhhhmo
osssssssssssso
.oooooooooooo.
.....omso.....
......oo......
""", GOLD)
    add("high-4", """
...oooooooo...
..ohhhommhho..
.ohhhohmomhho.
ohhhohhhmommmo
oooooooooooooo
.ohhommmomso..
..ohommmoso...
...oommsoo....
....omso.....
.....oo......
""", {"o": INK, "h": "#9deaff", "m": "#32b6eb", "s": "#3569bc"})
    star = """
......o.......
.....oho......
.....ohmo.....
....ohhmmo....
ooooohmmmooooo
ohhhhhhhmmmso.
.ohhmmmmmmso..
..ohmmmmmso...
..ohmmmmmso...
..ohmmmmmso...
.ohmmosmmmso..
.ohso..osmso.
.ooo....oooo..
"""
    add("high-5", star, GOLD)
    add("high-6", """
o.....oo.....o
oho..ohho..oho
ohmo.ohmo.ommo
ohhmoohmoommmo
ohhhmohmommsmo
ohhhhhhhmmmsmo
.ohhhhhmmmsmo.
.oooooooooooo.
.ohmmrmmrmmso.
.ohhhhhhhhhso.
.osssssssssso.
.oooooooooooo.
""", {**GOLD, "r": "#ed4b55"})
    add("high-7", """
.oooo....oooo.
ohhmo....ohmso
ohomo....omoso
ohhmo....ommso
ohhmo....ommso
ohomo....omoso
ohhmo....ommso
ohhmo....ommso
.ohmmo..ommso.
.ohommoomomso.
..ohmmmmmmso..
...ohssssso...
....oooooo....
""", {"o": INK, "h": "#efdfa7", "m": "#a9acb5", "s": "#72727e"})
    add("high-8", """
..ooo...ooo..
.ohhmo.ohhmo.
ohhmmmoohmmmo
ohmmmmoommmso
.ommmmoommso.
..ommmommso..
...oommoo....
..ohmmommmo..
.ohhmmommmso.
ohhmmmoommmso
ohmmmsoommmso
.ossso.omsoo.
..ooo..omso..
........oo...
""", {"o": INK, "h": "#a0e66b", "m": "#48b85e", "s": "#277c50"})
    add("high-9", """
....oooooo....
..oohhhhhhoo..
.ohhmmmmmmsso.
.ohmmmommmso.
ohmmmohommmmso
ohmmoohoommmso
ohmmhhhhhhmmso
ohmmmhhhhmmmso
ohmmmhhhhmmmso
ohmmhhoohhmmso
.ohmmmmmmmmso.
.osssssssssso.
..oossssssoo..
....oooooo....
""", GOLD)
    for number, rank in enumerate(("A", "K", "Q", "J", "10"), 11):
        images[f"low-{number}"] = card(rank)
    add("low-16", """
.......oooo..
.....oogggo.
....oggggoo..
...ogogo....
...ogo.ogo...
...ogo..ogo..
..oooo..oooo.
.ohhmsoohhmso
ohmmmsohmmmso
ohmmmsohmmmso
ommmmsommmso
.ossso.ossso
..ooo...ooo..
""", {**RED, "g": "#60b65b"})
    add("low-17", """
........ooo...
......oogggo..
....ooooooo...
..oohhhhmmso..
.ohhhhmmmmmso.
ohhhmmmmmmmmso
ohhmmmmmmmmmso
ohmmmmmmmmmmso
.ommmmmmmmmso.
..osssssssso..
...ooooooo....
""", {**GOLD, "g": "#60b65b"})
    add("low-18", """
......oo.....
.....oggoo...
.....ogggo...
...oooooooo..
..ohhhhmmmso.
.ohhhmmmmmmso
ohhhmmmmmmmso
ohhmmmmmmmmso
ohmmmmmmmmmso
ommmmmmmmmmso
.ommmmmmmmso.
..ossssssso..
...ooooooo...
""", {"o": INK, "h": "#ffcf70", "m": "#f59632", "s": "#bc572a", "g": "#60b65b"})
    add("low-19", """
......oo.....
.....oggoo...
...ooogggoo..
..ohhmooooo..
.ohhmmohhmmo.
ohhmmohhmmmmo
ohmmmohmmmmmo
ommmsommmmso
.osssommmso.
..oooosssso..
......oooo...
""", PURPLE)
    add("low-20", """
......oo.....
....oogggoo..
...oggggoo...
..ooooooooo..
.ohhmoohhmmo.
.ohmmoohmmso.
..ooohmoooo..
.ohmohmsohmo.
.omsommsomso.
..ooohmoooo..
...ohhmso....
...ommmso....
....omso.....
.....oo......
""", PURPLE)
    wild = sprite("""
..oooooooooo..
.orrrryyyyygo.
orrrrryyyygggo
oooooooooooooo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
owwwwwwwwwwwwo
oooooooooooooo
obbbbbgggggggo
.obbbbggggggo.
..oooooooooo..
""", {"o": INK, "r": "#ff4f78", "y": "#ffe477", "g": "#50dc9b", "b": "#6698ff", "w": WHITE})
    ImageDraw.Draw(wild).rectangle((1, 5, 14, 9), fill=INK)
    lettering(wild, "WILD", 1, 5, [WHITE])
    images["special-wild"] = wild
    add("special-scatter", """
.o....o....o..
omo..omo..omo.
..o.omhmo.o...
o..oomhmoo..o.
omoomhhhmoomo
.omhhwwwhhmo..
..ohwwwwwhmo..
oohhwwwwwhhmoo
.omhhwwwhhmo..
..ommhhhmmo..
.omoomhmoomo.
omo..omo..omo.
.o....o....o..
""", {"o": INK, "m": "#f94caa", "h": "#ffe64c", "w": WHITE})
    add("special-bonus", """
..oooo..oooo..
.ohhhhoohhhho.
.ohmmhohmmhho.
..oohhohhoo...
oooooooooooooo
ommmmhhhhmmmmo
ommmmhhhhmmmmo
oooooooooooooo
.ommmhhhhmmso.
.ommmhhhhmmso.
.ommmhhhhmmso.
.ommmhhhhmmso.
.ossshhhhssso.
.oooooooooooo.
""", {"o": INK, "s": "#993a89", "m": "#ed53ac", "h": "#ffe477"})
    multiplier = sprite("""
......oooo....
.....ohhho....
....ohhho.....
...ohhho......
..ohhhhooooo..
.ohhhhhhhhho..
.oooooooooho..
obbbbbbbbboo..
obbbbbbbbbo...
obbbbbbbbbo...
obbbbbbbbbo...
obbbbbbbbbo...
.ooooooooo....
""", {"o": INK, "h": "#faff61", "b": "#8054df"})
    draw = ImageDraw.Draw(multiplier)
    for x, y in ((3, 8), (5, 8), (4, 9), (3, 10), (5, 10)):
        draw.point((x, y), fill=WHITE)
    lettering(multiplier, "2", 7, 8, [WHITE])
    images["special-multiplier"] = multiplier
    add("special-generic", """
.c..........c.
ccc.oooooo.ccc
.c.owmmmmmo.c.
..owmmhhhmmo..
.owmmhmmmhmo.
.owmmmmmhmmo.
.ommmmmhmmmo.
.ommmmmhmmmo.
.ommmmmmmmmo.
.ommmmmhmmmo.
..osmmmmmso..
.c.ossssso.c.
ccc.oooooo.ccc
.c..........c.
""", {"o": INK, "s": "#613474", "m": "#9a55c5", "h": "#ffe477", "c": "#50dcdb", "w": WHITE})
    freespin = sprite("""
.c....oo....c.
ccc..ohho..ccc
.c.oooooooo.c.
..ohhhhhhhho..
.oowwwwwwwoo..
ohowwwwwwwommo
ohowwwwwwwommo
ohowwwwwwwommo
ohowwwwwwwommo
ohowwwwwwwommo
.oowwwwwwwoo..
..ohhhhhhhho..
.c.oooooooo.c.
......cc......
""", {**GOLD, "c": "#50dcdb"})
    lettering(freespin, "FS", 4, 6, [INK])
    images["special-freespin"] = freespin
    add("special-jackpot", """
......w.......
.w...www...w..
www...w...www.
.w.o..o..o.w..
..ohoohhooho..
..ohhohhohho..
..ohhhrrhhho..
..ohhrrrrhho..
..ohhhrrhhho..
..osssssssso..
..ohhhhhhhho..
...ooooooo....
..ohhmoohhmo..
..osssossso..
""", {**GOLD, "r": "#ff4f78"})
    add("special-coin", """
.c..........c.
ccc..oooo..ccc
.c.oohhhhoo.c.
..ohhhmmmmso.
.ohhhmmmmmmso.
.ohhmmhhmmmso.
ohhmmhmmhmmmso
ohhmmhmmmmmmso
ohhmmhmmhmmmso
.ohhmmhhmmmso.
.ohmmmmmmmmso.
..osmmmmmmso.
.c.oossssoo.c.
ccc..oooo..ccc
""", {**GOLD, "c": "#50dcdb"})
    add("special-respin", """
....ooooo.....
..oohhhhhoo.o.
.ohhhhhmmmoho.
.ohhsooommhho.
ohhso..ohhhho.
ohmo...oooooo.
omo...........
...........omo
.oooooo...omso
.ohhhho..omsso
.ohhmmooossso.
.ohommmsssso..
.o.oossssoo...
.....oooo.....
""", {"o": INK, "s": "#247b92", "m": "#34d5c4", "h": "#faff61"})
    superwild = sprite("""
......o.......
..o..oho..o...
.ohoohhhooho..
.ohhhrhrhhho..
..ohhhhhhho...
.oooooooooooo.
oppppppppppppo
oooooooooooooo
oooooooooooooo
oooooooooooooo
oooooooooooooo
oooooooooooooo
.oppphhhhpppo.
..oooooooooo..
""", {"o": INK, "p": "#9a55c5", "h": "#ffe477", "r": "#ff4f78"})
    lettering(superwild, "WILD", 1, 8, [WHITE])
    images["special-superwild"] = superwild
    return images


def main():
    images = build_theme()
    assert len(images) == 29
    # Validate the entire batch before writing any files.
    for name, image in images.items():
        assert image.mode == "RGBA" and image.size == (16, 16), name
        assert {alpha for _, alpha in image.getchannel("A").getcolors()} == {0, 255}, name
        colors = image.getcolors(256)
        assert colors is not None and len(colors) <= 7, name  # Six + transparency.
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, image in images.items():
        image.save(OUTPUT / f"{name}.png")
        print(f"{name}.png")


if __name__ == "__main__":
    main()
