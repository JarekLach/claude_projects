<#
.SYNOPSIS
    Konwertuje pliki dokumentów do formatu Markdown przy użyciu markitdown.

.DESCRIPTION
    Przetwarza wszystkie obsługiwane pliki w podanym folderze i zapisuje wyniki
    jako pliki .md. Działa lokalnie — bez połączenia z chmurą.

    Wymagania (jednorazowa instalacja):
        pip install markitdown

.PARAMETER SourceFolder
    Folder z plikami do konwersji. Wymagany.

.PARAMETER OutputFolder
    Folder docelowy dla plików .md.
    Domyślnie: podfolder "_markdown" wewnątrz SourceFolder.

.PARAMETER Recursive
    Jeśli podany, przetwarza również podfoldery (zachowuje strukturę katalogów).

.PARAMETER Extensions
    Lista rozszerzeń do przetworzenia.
    Domyślnie: pdf, docx, pptx, xlsx, html, htm, csv, xml, json, txt, rtf.

.PARAMETER Overwrite
    Jeśli podany, nadpisuje istniejące pliki .md. Domyślnie pomija.

.EXAMPLE
    .\Convert-ToMarkdown.ps1 -SourceFolder "C:\Dokumenty\Projekty"

.EXAMPLE
    .\Convert-ToMarkdown.ps1 -SourceFolder "C:\Raporty" -OutputFolder "C:\Raporty\MD" -Recursive -Overwrite
#>

param(
    [Parameter(Mandatory = $true, HelpMessage = "Folder z plikami źródłowymi")]
    [string]$SourceFolder,

    [string]$OutputFolder = "",

    [switch]$Recursive,

    [string[]]$Extensions = @(".pdf", ".docx", ".pptx", ".xlsx", ".html", ".htm", ".csv", ".xml", ".json", ".txt", ".rtf"),

    [switch]$Overwrite
)

# ─── Kolory konsoli ────────────────────────────────────────────────────────────

function Write-Info    ($msg) { Write-Host "  $msg" -ForegroundColor Cyan }
function Write-Ok      ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function Write-Skip    ($msg) { Write-Host "  [--]  $msg" -ForegroundColor DarkGray }
function Write-Fail    ($msg) { Write-Host "  [!!]  $msg" -ForegroundColor Red }
function Write-Section ($msg) { Write-Host "`n$msg" -ForegroundColor White }

# ─── Weryfikacja wymagań ───────────────────────────────────────────────────────

Write-Section "=== Convert-ToMarkdown.ps1 ==="

# Sprawdź Python
try {
    $pythonVersion = python --version 2>&1
    Write-Info "Python: $pythonVersion"
} catch {
    Write-Fail "Python nie znaleziony. Zainstaluj Python 3.x i dodaj do PATH."
    exit 1
}

# Sprawdź markitdown
$markitdownCheck = python -c "import markitdown" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Fail "markitdown nie zainstalowany."
    Write-Info "Uruchom: pip install markitdown"
    exit 1
}
Write-Info "markitdown: OK"

# ─── Walidacja folderów ────────────────────────────────────────────────────────

if (-not (Test-Path $SourceFolder)) {
    Write-Fail "Folder źródłowy nie istnieje: $SourceFolder"
    exit 1
}

$SourceFolder = (Resolve-Path $SourceFolder).Path

if ($OutputFolder -eq "") {
    $OutputFolder = Join-Path $SourceFolder "_markdown"
}

if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
    Write-Info "Utworzono folder docelowy: $OutputFolder"
} else {
    Write-Info "Folder docelowy: $OutputFolder"
}

# ─── Zbieranie plików ──────────────────────────────────────────────────────────

Write-Section "Szukam plików..."

$searchParams = @{
    Path    = $SourceFolder
    File    = $true
    Recurse = $Recursive.IsPresent
}

$allFiles = Get-ChildItem @searchParams | Where-Object {
    $Extensions -contains $_.Extension.ToLower()
} | Where-Object {
    # Pomijaj pliki już wewnątrz folderu docelowego
    -not $_.FullName.StartsWith($OutputFolder)
}

if ($allFiles.Count -eq 0) {
    Write-Info "Brak plików do przetworzenia w: $SourceFolder"
    exit 0
}

Write-Info "Znaleziono plików: $($allFiles.Count)"

# ─── Konwersja ─────────────────────────────────────────────────────────────────

Write-Section "Konwersja..."

$stats = @{ OK = 0; Skipped = 0; Failed = 0 }

foreach ($file in $allFiles) {

    # Wyznacz ścieżkę docelową (zachowaj strukturę podfolderów jeśli -Recursive)
    if ($Recursive) {
        $relativePath = $file.FullName.Substring($SourceFolder.Length).TrimStart('\', '/')
        $relativeDir  = Split-Path $relativePath -Parent
        $targetDir    = Join-Path $OutputFolder $relativeDir
    } else {
        $targetDir = $OutputFolder
    }

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $outputFile = Join-Path $targetDir ($file.BaseName + ".md")

    # Pomiń jeśli plik docelowy istnieje i nie ma flagi -Overwrite
    if ((Test-Path $outputFile) -and -not $Overwrite) {
        Write-Skip "Pomijam (istnieje): $($file.Name)"
        $stats.Skipped++
        continue
    }

    # Wywołaj markitdown
    $result = python -m markitdown "$($file.FullName)" 2>&1

    if ($LASTEXITCODE -eq 0 -and $result) {
        # Zapisz wynik — markitdown drukuje Markdown na stdout
        $result | Set-Content -Path $outputFile -Encoding UTF8
        Write-Ok "$($file.Name)  →  $($file.BaseName).md"
        $stats.OK++
    } else {
        Write-Fail "Błąd: $($file.Name)"
        if ($result) { Write-Host "         $result" -ForegroundColor DarkRed }
        $stats.Failed++
    }
}

# ─── Podsumowanie ──────────────────────────────────────────────────────────────

Write-Section "─────────────────────────────"
Write-Host "  Sukces:   $($stats.OK)" -ForegroundColor Green
Write-Host "  Pominięto: $($stats.Skipped)" -ForegroundColor DarkGray
Write-Host "  Błędy:    $($stats.Failed)" -ForegroundColor $(if ($stats.Failed -gt 0) { "Red" } else { "DarkGray" })
Write-Section "Pliki .md zapisane w: $OutputFolder"
