<#
.SYNOPSIS
    Konwertuje dokumenty do Markdown przy użyciu MarkItDown.
    Działa w bieżącym folderze. Wyniki zapisuje obok oryginałów.

.DESCRIPTION
    Wymagania: pip install markitdown

.PARAMETER File
    Jeden konkretny plik do konwersji.
    Bez parametru — przetwarza wszystkie obsługiwane pliki w bieżącym folderze.

.PARAMETER Overwrite
    Nadpisuje istniejące pliki .md. Domyślnie pomija.

.EXAMPLE
    .\mid.ps1
    .\mid.ps1 -File dokument.pdf
    .\mid.ps1 -Overwrite
#>

param(
    [string]$File = "",
    [switch]$Overwrite
)

$supported = @(".pdf", ".docx", ".pptx", ".xlsx", ".html", ".htm",
               ".csv", ".xml", ".json", ".txt", ".rtf")

# Sprawdź markitdown (przez Python — niezależnie od PATH)
$checkMid = python -c "import markitdown" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "markitdown nie zainstalowany. Uruchom: pip install markitdown" -ForegroundColor Red
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
    $files = Get-ChildItem -File | Where-Object { $supported -contains $_.Extension.ToLower() }
}

if ($files.Count -eq 0) {
    Write-Host "Brak plików do przetworzenia." -ForegroundColor DarkGray
    exit 0
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
from markitdown import MarkItDown
import sys
try:
    md = MarkItDown()
    result = md.convert(r'$($f.FullName)').text_content
    open(r'$out', 'w', encoding='utf-8').write(result)
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
