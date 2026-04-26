<#
.SYNOPSIS
    Konwertuje pliki PDF do Markdown przy użyciu PyMuPDF4LLM.
    Działa w bieżącym folderze. Wyniki zapisuje obok oryginałów.

.DESCRIPTION
    Wymagania: pip install pymupdf4llm

    PyMuPDF4LLM zachowuje układ strony, tabele i nagłówki lepiej niż
    ogólne konwertery — polecany dla technicznych i wielokolumnowych PDF.

.PARAMETER File
    Jeden konkretny plik PDF do konwersji.
    Bez parametru — przetwarza wszystkie pliki .pdf w bieżącym folderze.

.PARAMETER Overwrite
    Nadpisuje istniejące pliki .md. Domyślnie pomija.

.PARAMETER Pages
    Zakres stron do wyodrębnienia, np. "0,1,2" (indeksowane od 0).
    Bez parametru — przetwarza cały dokument.

.EXAMPLE
    .\mupdf.ps1
    .\mupdf.ps1 -File raport.pdf
    .\mupdf.ps1 -File raport.pdf -Pages "0,1,2"
    .\mupdf.ps1 -Overwrite
#>

param(
    [string]$File = "",
    [switch]$Overwrite,
    [string]$Pages = ""
)

# Sprawdź pymupdf4llm
$check = python -c "import pymupdf4llm" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "pymupdf4llm nie zainstalowany. Uruchom: pip install pymupdf4llm" -ForegroundColor Red
    exit 1
}

# Zbierz pliki
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

# Buduj opcjonalny argument pages
$pagesArg = ""
if ($Pages -ne "") {
    # Zamień "0,1,2" na listę Pythona [0,1,2]
    $pagesArg = "pages=[$Pages], "
}

$ok = 0; $skip = 0; $fail = 0

foreach ($f in $files) {
    $out = Join-Path $f.DirectoryName ($f.BaseName + ".md")

    if ((Test-Path $out) -and -not $Overwrite) {
        Write-Host "  --  $($f.Name)  (pomijam, .md istnieje)" -ForegroundColor DarkGray
        $skip++
        continue
    }

    $pyCmd = @"
import pymupdf4llm, sys
try:
    md = pymupdf4llm.to_markdown(r'$($f.FullName)', ${pagesArg}show_progress=False)
    open(r'$out', 'w', encoding='utf-8').write(md)
    sys.exit(0)
except Exception as e:
    print(e, file=sys.stderr)
    sys.exit(1)
"@

    $result = python -c $pyCmd 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK  $($f.Name)  →  $($f.BaseName).md" -ForegroundColor Green
        $ok++
    } else {
        Write-Host "  !!  $($f.Name)  (błąd: $result)" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "  OK: $ok   Pominięto: $skip   Błędy: $fail" -ForegroundColor White
