from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OUTPUT = IMAGES / "optimized"
GALLERY_DIRS = (
    "album-shows",
    "album-Tanti-Cba",
    "album-paraguay",
    "album-backstage",
)
SUPPORTED = {".jpg", ".jpeg", ".png"}


def load_image(path: Path) -> Image.Image:
    image = ImageOps.exif_transpose(Image.open(path))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, "white")
        background.paste(image, mask=image.getchannel("A"))
        image = background
    return image


def save_webp(image: Image.Image, destination: Path, quality: int) -> dict[str, object]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=quality, method=6, optimize=True)
    return {
        "path": destination.relative_to(ROOT).as_posix(),
        "width": image.width,
        "height": image.height,
        "bytes": destination.stat().st_size,
    }


def resized(image: Image.Image, maximum: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(maximum, Image.Resampling.LANCZOS)
    return copy


def process_gallery() -> list[dict[str, object]]:
    results = []
    for directory in GALLERY_DIRS:
        for source in sorted((IMAGES / directory).iterdir()):
            if source.suffix.lower() not in SUPPORTED:
                continue
            image = load_image(source)
            thumb = ImageOps.fit(image, (480, 480), Image.Resampling.LANCZOS)
            full = resized(image, (1600, 1600))
            relative = Path(directory) / f"{source.stem}.webp"
            results.append(
                {
                    "original": source.relative_to(ROOT).as_posix(),
                    "thumb": save_webp(thumb, OUTPUT / "thumbs" / relative, 74),
                    "full": save_webp(full, OUTPUT / "full" / relative, 82),
                }
            )
    return results


def process_content(directory: str, maximum: tuple[int, int], quality: int) -> list[dict[str, object]]:
    results = []
    for source in sorted((IMAGES / directory).iterdir()):
        if source.suffix.lower() not in SUPPORTED:
            continue
        image = resized(load_image(source), maximum)
        relative = Path(directory) / f"{source.stem}.webp"
        results.append(
            {
                "original": source.relative_to(ROOT).as_posix(),
                "optimized": save_webp(image, OUTPUT / "content" / relative, quality),
            }
        )
    return results


def process_agenda() -> list[dict[str, object]]:
    results = []
    for source in sorted((IMAGES / "img-agenda").iterdir()):
        if source.suffix.lower() not in {".jpg", ".jpeg"}:
            continue
        image = load_image(source)
        thumb = resized(image, (420, 600))
        full = resized(image, (1400, 1800))
        relative = Path("img-agenda") / f"{source.stem}.webp"
        results.append(
            {
                "original": source.relative_to(ROOT).as_posix(),
                "thumb": save_webp(thumb, OUTPUT / "thumbs" / relative, 74),
                "full": save_webp(full, OUTPUT / "full" / relative, 82),
            }
        )
    return results


def process_hero() -> dict[str, object]:
    source = IMAGES / "grupo1.jpeg"
    image = resized(load_image(source), (1920, 1920))
    return {
        "original": source.relative_to(ROOT).as_posix(),
        "optimized": save_webp(image, OUTPUT / "content" / "grupo1.webp", 80),
    }


def main() -> None:
    manifest = {
        "gallery": process_gallery(),
        "timeline": process_content("album-timeline", (1200, 1200), 80),
        "agenda": process_agenda(),
        "hero": process_hero(),
    }
    manifest_path = OUTPUT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    generated = list(OUTPUT.rglob("*.webp"))
    original_bytes = sum(
        Path(ROOT / item["original"]).stat().st_size
        for group in (manifest["gallery"], manifest["timeline"], manifest["agenda"])
        for item in group
    ) + Path(ROOT / manifest["hero"]["original"]).stat().st_size
    optimized_bytes = sum(path.stat().st_size for path in generated)
    print(
        json.dumps(
            {
                "generated": len(generated),
                "original_mb": round(original_bytes / 1024 / 1024, 2),
                "optimized_mb": round(optimized_bytes / 1024 / 1024, 2),
                "manifest": manifest_path.relative_to(ROOT).as_posix(),
            }
        )
    )


if __name__ == "__main__":
    main()
