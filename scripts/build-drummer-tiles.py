# Pre-keys the drummer tile art once, instead of in every player's browser:
# same magenta key as art.js keyDrummerPixels (Patch keeps its native alpha), transparent
# margins trimmed, longest side at most 512 px, lossless WebP with alpha.
# Usage: python scripts/build-drummer-tiles.py   (reads art-source/, writes dist/)
from pathlib import Path
from PIL import Image

SOURCE, TARGET, MAX_SIDE = Path('art-source/drummer/tiles'), Path('dist/art/drummer/tiles'), 512

def keyed(image):
    rgba = image.convert('RGBA')
    if image.mode == 'RGBA':
        return rgba
    pixels = [(r, g, b, 0 if min(r, b) - g > 80 else a) for r, g, b, a in rgba.getdata()]
    rgba.putdata(pixels)
    return rgba

for source in sorted(SOURCE.glob('*.png')):
    art = keyed(Image.open(source))
    alpha = art.getchannel('A').point(lambda a: 255 if a > 16 else 0)
    art = art.crop(alpha.getbbox())
    art.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    target = TARGET / (source.stem + '.webp')
    art.save(target, 'WEBP', lossless=True, quality=100, method=6)
    print(f'{target}: {art.size[0]}x{art.size[1]}, {target.stat().st_size // 1024} KB')
