"""Build the self-contained HTML. No third-party dependency required."""
from pathlib import Path
import argparse
import base64

def main():
    root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=root.parent.parent / 'public' / 'slime-farm-generator.html')
    args = parser.parse_args()
    template = (root / 'ui.html').read_text(encoding='utf-8')
    template = template.replace('/*__STYLE__*/', (root / 'ui.css').read_text(encoding='utf-8'))
    image = base64.b64encode((root / 'assets/yueyue.png').read_bytes()).decode('ascii')
    template = template.replace('__YUEYUE_IMAGE__', 'data:image/png;base64,' + image)
    marker = '/*__CORE__*/'
    if template.count(marker) != 1:
        raise RuntimeError('The UI template must contain exactly one core marker.')
    html = template.replace(marker, (root / 'core.js').read_text(encoding='utf-8'))
    biome_marker = '/*__BIOMES__*/'
    if html.count(biome_marker) != 1:
        raise RuntimeError('The UI template must contain exactly one biome marker.')
    html = html.replace(biome_marker, (root / 'biomes.js').read_text(encoding='utf-8'))
    for marker, source in [
        ('/*__STRUCTURE_ENGINE__*/', 'structure_engine.js'),
        ('/*__STRUCTURES__*/', 'structures.js'),
    ]:
        if html.count(marker) != 1:
            raise RuntimeError(f'The UI template must contain exactly one {marker} marker.')
        html = html.replace(marker, (root / source).read_text(encoding='utf-8'))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html, encoding='utf-8')
    print(f'Created {args.output} ({args.output.stat().st_size:,} bytes)')

if __name__ == '__main__':
    main()
