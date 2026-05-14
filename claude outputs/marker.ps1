<#
.SYNOPSIS
    Konwertuje PDF do Markdown przy uzyciu Marker (deep learning).
    Dziala w biezacym folderze. Wyniki zapisuje obok oryginalow.

.DESCRIPTION
    Wymagania: py -3.12 -m pip install marker-pdf

.PARAMETER File
    Jeden plik PDF. Bez parametru -- wszystkie .pdf w folderze.

.PARAMETER Overwrite
    Nadpisuje istniejace .md. Domyslnie pomija.

.PARAMETER Quiet
    Ukrywa output markera (domyslnie widoczny).

.EXAMPLE
    .\marker.ps1
    .\marker.ps1 -File raport.pdf
    .\marker.ps1 -Overwrite
    .\marker.ps1 -Quiet
#>

param(
    [string]$File = "",
    [switch]$Overwrite,
    [switch]$Quiet
)

$PY = "py"
$PY_VER = "-3.12"

# Sprawdz marker
$check = & $PY $PY_VER -c "import marker" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  marker-pdf nie znaleziony." -ForegroundColor Red
    Write-Host "  Zainstaluj: py -3.12 -m pip install marker-pdf" -ForegroundColor Yellow
    exit 1
}

# Ustal sciezke do marker_single (skrypt w Scripts/)
$markerScript = & $PY $PY_VER -c "import sys, os; scripts = os.path.join(os.path.dirname(sys.executable), 'Scripts'); print(os.path.join(scripts, 'marker_single.exe'))" 2>&1
if (-not (Test-Path $markerScript)) {
    # Probuj bez .exe
    $markerScript = & $PY $PY_VER -c "import sys, os; scripts = os.path.join(os.path.dirname(sys.executable), 'Scripts'); print(os.path.join(scripts, 'marker_single'))" 2>&1
}

Write-Host "  marker_single: $markerScript" -ForegroundColor DarkGray
Write-Host ""

# Zbierz pliki
if ($File -ne "") {
    if (-not (Test-Path $File)) {
        Write-Host "  Plik nie istnieje: $File" -ForegroundColor Red
        exit 1
    }
    $files = @(Get-Item $File)
} else {
    $files = Get-ChildItem -File -Filter "*.pdf"
}

if ($files.Count -eq 0) {
    Write-Host "  Brak plikow PDF." -ForegroundColor DarkGray
    exit 0
}

$ok = 0
$skip = 0
$fail = 0
$tmpDir = Join-Path $env:TEMP ("marker_out_" + $PID)

foreach ($f in $files) {

    $outFile = Join-Path $f.DirectoryName ($f.BaseName + ".md")

    if ((Test-Path $outFile) -and (-not $Overwrite)) {
        Write-Host ("  --  " + $f.Name + "  (pomijam)") -ForegroundColor DarkGray
        $skip = $skip + 1
        continue
    }

    Write-Host ("  >>  " + $f.Name) -ForegroundColor Cyan

    if (Test-Path $tmpDir) {
        Remove-Item $tmpDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    # Uruchom marker_single -- output widoczny jesli nie -Quiet
    if ($Quiet) {
        & $markerScript $f.FullName --output_dir $tmpDir 2>&1 | Out-Null
    } else {
        & $markerScript $f.FullName --output_dir $tmpDir
    }

    # Znajdz wygenerowany .md
    $generated = Get-ChildItem -Path $tmpDir -Filter "*.md" -Recurse | Select-Object -First 1

    if ($null -ne $generated) {
        Copy-Item $generated.FullName -Destination $outFile -Force
        Write-Host ("  OK  ->  " + $f.BaseName + ".md") -ForegroundColor Green
        $ok = $ok + 1
    } else {
        Write-Host "  !!  Brak wyniku -- sprawdz bledy powyzej." -ForegroundColor Red
        $fail = $fail + 1
    }

    if (Test-Path $tmpDir) {
        Remove-Item $tmpDir -Recurse -Force
    }
}

Write-Host ""
Write-Host ("  OK: " + $ok + "   Pominieto: " + $skip + "   Bledy: " + $fail) -ForegroundColor White
