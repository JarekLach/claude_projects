<#
.SYNOPSIS
    OCR skanowanych PDF → Markdown. Używa Tesseract lokalnie.
    Działa w bieżącym folderze. Wyniki zapisuje obok oryginałów.

.DESCRIPTION
    Wymagania:
        winget install UB-Mannheim.TesseractOCR
        pip install pytesseract pymupdf pillow

    Tesseract musi być w PATH lub podaj -TesseractPath.

.PARAMETER File
    Jeden konkretny plik PDF. Bez parametru — wszystkie .pdf w folderze.

.PARAMETER Lang
    Język OCR. Domyślnie "pol+eng" (polski + angielski).
    Inne: "deu" (niemiecki), "pol" (tylko polski), "eng" (tylko angielski).
    Lista zainstalowanych: tesseract --list-langs

.PARAMETER Dpi
    Rozdzielczość renderowania stron (wpływa na jakość OCR).
    Domyślnie 300. Dla słabych skanów spróbuj 400.

.PARAMETER TesseractPath
    Ścieżka do tesseract.exe jeśli nie jest w PATH.
    Np.: "C:\Program Files\Tesseract-OCR\tesseract.exe"

.PARAMETER Overwrite
    Nadpisuje istniejące pliki .md. Domyślnie pomija.

.EXAMPLE
    .\ocr.ps1
    .\ocr.ps1 -File skan.pdf
    .\ocr.ps1 -Lang "pol"
    .\ocr.ps1 -File skan.pdf -Dpi 400
    .\ocr.ps1 -TesseractPath "C:\Program Files\Tesseract-OCR\tesseract.exe"
#>

param(
    [string]$File = "",
    [string]$Lang = "pol+eng",
    [int]$Dpi = 300,
    [string]$TesseractPath = "",
    [switch]$Overwrite
)

# ─── Sprawdź wymagania ─────────────────────────────────────────────────────────

# Python + pytesseract
$check = python -c "import pytesseract, fitz, PIL" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Brak wymaganych pakietów. Uruchom:" -ForegroundColor Red
    Write-Host "  pip install pytesseract pymupdf pillow" -ForegroundColor Yellow
    exit 1
}

# Tesseract binary
if ($TesseractPath -ne "") {
    if (-not (Test-Path $TesseractPath)) {
        Write-Host "Tesseract nie znaleziony pod: $TesseractPath" -ForegroundColor Red
        exit 1
    }
    $tessCmd = $TesseractPath
} elseif (Get-Command tesseract -ErrorAction SilentlyContinue) {
    $tessCmd = "tesseract"
} else {
    # Spróbuj domyślnej lokalizacji
    $defaultPath = "C:\Program Files\Tesseract-OCR\tesseract.exe"
    if (Test-Path $defaultPath) {
        $tessCmd = $defaultPath
    } else {
        Write-Host "Tesseract nie znaleziony w PATH." -ForegroundColor Red
        Write-Host "Zainstaluj: winget install UB-Mannheim.TesseractOCR" -ForegroundColor Yellow
        Write-Host "Lub podaj ścieżkę: -TesseractPath ""C:\...\tesseract.exe""" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "  Tesseract: $tessCmd" -ForegroundColor DarkGray
Write-Host "  Język: $Lang   DPI: $Dpi" -ForegroundColor DarkGray

# ─── Zbierz pliki ──────────────────────────────────────────────────────────────

if ($File -ne "") {
    if (-not (Test-Path $File)) {
        Write-Host "Plik nie istnieje: $File" -ForegroundColor Red
        exit 1
    }
    $files = @(Get-Item $File)
} else {
    $files = Get-ChildItem -File -Filter "*.pdf"
}

if ($files.Count -eq 0) {
    Write-Host "Brak plików PDF do przetworzenia." -ForegroundColor DarkGray
    exit 0
}

Write-Host ""

# ─── OCR ───────────────────────────────────────────────────────────────────────

$ok = 0; $skip = 0; $fail = 0

foreach ($f in $files) {
    $out = Join-Path $f.DirectoryName ($f.BaseName + ".md")

    if ((Test-Path $out) -and -not $Overwrite) {
        Write-Host "  --  $($f.Name)  (pomijam, .md istnieje)" -ForegroundColor DarkGray
        $skip++
        continue
    }

    Write-Host "  >>  $($f.Name) ..." -ForegroundColor Cyan -NoNewline

    $pyCmd = @"
import fitz, pytesseract, sys
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = r'$tessCmd'

try:
    doc = fitz.open(r'$($f.FullName)')
    pages_text = []

    for i, page in enumerate(doc):
        mat = fitz.Matrix($Dpi / 72, $Dpi / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
        img = Image.open(io.BytesIO(pix.tobytes('png')))
        text = pytesseract.image_to_string(img, lang='$Lang')
        pages_text.append(f'## Strona {i+1}\n\n{text.strip()}')

    doc.close()
    markdown = '\n\n---\n\n'.join(pages_text)
    open(r'$out', 'w', encoding='utf-8').write(markdown)
    print(f' {len(doc)} str.')
    sys.exit(0)

except Exception as e:
    print(f' BŁĄD: {e}', file=sys.stderr)
    sys.exit(1)
"@

    $result = python -c $pyCmd 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host $result -ForegroundColor Green
        Write-Host "      → $($f.BaseName).md" -ForegroundColor DarkGray
        $ok++
    } else {
        Write-Host ""
        Write-Host "  !!  Błąd: $result" -ForegroundColor Red
        $fail++
    }
}

# ─── Podsumowanie ──────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  OK: $ok   Pominięto: $skip   Błędy: $fail" -ForegroundColor White
