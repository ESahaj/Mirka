"""Vytvoří galerie.json ze souborů uložených v materiálových složkách."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
FOLDERS = (
    'chemie/ucivo/obrázky',
    'chemie/procvicovani',
    'fyzika/obrazky',
    'fyzika/testy',
    'fyzika/ucivo',
)
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.pdf', '.doc', '.docx'}

files = []
for folder in FOLDERS:
    directory = ROOT / folder
    if not directory.is_dir():
        continue
    for path in directory.iterdir():
        if path.is_file() and not path.is_symlink() and path.suffix.lower() in EXTENSIONS:
            files.append({'path': path.relative_to(ROOT).as_posix(), 'version': str(path.stat().st_mtime_ns)})

files.sort(key=lambda item: item['path'].casefold())
(ROOT / 'galerie.json').write_text(json.dumps(files, ensure_ascii=False, indent=2), encoding='utf-8')
