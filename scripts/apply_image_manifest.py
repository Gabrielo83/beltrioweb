from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
MANIFEST_PATH = ROOT / "images" / "optimized" / "manifest.json"


def image_attributes(width: int, height: int) -> str:
    return f'width="{width}" height="{height}" decoding="async"'


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    html = HTML_PATH.read_text(encoding="utf-8")
    replacements = 0

    for item in manifest["gallery"]:
        original = item["original"]
        thumb = item["thumb"]
        full = item["full"]
        old_data = f'data-src="{original}"'
        old_src = f'src="{original}"'
        if old_data in html:
            html = html.replace(old_data, f'data-src="{full["path"]}"')
            replacements += 1
        if old_src in html:
            attrs = image_attributes(thumb["width"], thumb["height"])
            html = html.replace(old_src, f'src="{thumb["path"]}" {attrs}')
            replacements += 1

    for item in manifest["timeline"]:
        original = item["original"]
        optimized = item["optimized"]
        old_src = f'src="{original}"'
        if old_src in html:
            attrs = image_attributes(optimized["width"], optimized["height"])
            html = html.replace(old_src, f'src="{optimized["path"]}" {attrs}')
            replacements += 1

    for item in manifest["agenda"]:
        original = item["original"]
        thumb = item["thumb"]
        full = item["full"]
        old_data = f'data-src="{original}"'
        old_src = f'src="{original}"'
        if old_data in html:
            html = html.replace(old_data, f'data-src="{full["path"]}"')
            replacements += 1
        if old_src in html:
            attrs = image_attributes(thumb["width"], thumb["height"])
            html = html.replace(old_src, f'src="{thumb["path"]}" {attrs}')
            replacements += 1

    HTML_PATH.write_text(html, encoding="utf-8", newline="\n")
    print(json.dumps({"replacements": replacements, "html": HTML_PATH.name}))


if __name__ == "__main__":
    main()
