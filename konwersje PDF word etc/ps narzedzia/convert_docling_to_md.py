"""
convert_docling_to_md.py
Konwertuje wszystkie obsługiwane pliki w podanym folderze do Markdown
za pomocą biblioteki docling. Wyniki trafiają do podfolderu \output\.

Użycie:
    python convert_docling_to_md.py                        # bieżący folder
    python convert_docling_to_md.py C:\sciezka\do\folderu  # wskazany folder
"""

import sys
from pathlib import Path
from docling.document_converter import DocumentConverter

# Formaty obsługiwane przez docling
SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".xlsx", ".html", ".md", ".txt"}


def convert_folder(source_dir: Path) -> None:
    output_dir = source_dir / "output"
    output_dir.mkdir(exist_ok=True)

    files = [
        f for f in source_dir.iterdir()
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not files:
        print(f"Brak obsługiwanych plików w: {source_dir}")
        return

    print(f"Znaleziono {len(files)} plik(ów). Rozpoczynam konwersję...\n")

    converter = DocumentConverter()
    ok, failed = 0, []

    for file in files:
        print(f"  → {file.name}")
        try:
            result = converter.convert(str(file))
            md_text = result.document.export_to_markdown()
            out_file = output_dir / (file.stem + ".md")
            out_file.write_text(md_text, encoding="utf-8")
            print(f"     OK → {out_file.name}")
            ok += 1
        except Exception as e:
            print(f"     BŁĄD: {e}")
            failed.append(file.name)

    print(f"\nGotowe: {ok} skonwertowano, {len(failed)} błędów.")
    if failed:
        print("Pliki z błędami:")
        for name in failed:
            print(f"  - {name}")
    print(f"\nWyniki zapisane w: {output_dir}")


if __name__ == "__main__":
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()

    if not folder.is_dir():
        print(f"Folder nie istnieje: {folder}")
        sys.exit(1)

    convert_folder(folder)
