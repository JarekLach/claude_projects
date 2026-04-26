# =============================================================
# Skrypt: scan_files.ps1
# Cel:    Skanowanie Desktop i Documents, zapis do CSV
# Uwaga:  Uruchom w PowerShell (prawy klik > Run with PowerShell
#         lub wklej sciezke w oknie PowerShell)
# =============================================================

$ErrorActionPreference = "Continue"

# --- Sciezki do skanowania ---
$folders = @(
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Downloads"
)

# --- Plik wynikowy ---
$outFile = "$env:USERPROFILE\OneDrive\Claude_Projects\Organizacja_projektow\files_inventory.csv"

Write-Host "=== Skanowanie plikow ===" -ForegroundColor Cyan
Write-Host ""

# --- Diagnostyka: sprawdz czy foldery istnieja ---
foreach ($f in $folders) {
    if (Test-Path $f) {
        $count = (Get-ChildItem $f -File -ErrorAction SilentlyContinue).Count
        Write-Host "[OK]  $f  ($count plikow w katalogu glownym)" -ForegroundColor Green
    } else {
        Write-Host "[BRAK] $f  - folder nie istnieje!" -ForegroundColor Red
    }
}
Write-Host ""

# --- Skanowanie rekursywne ---
$allFiles = @()
foreach ($f in $folders) {
    if (Test-Path $f) {
        $files = Get-ChildItem $f -Recurse -File -ErrorAction SilentlyContinue
        Write-Host "Znaleziono $($files.Count) plikow w $f" -ForegroundColor Yellow
        $allFiles += $files
    }
}

Write-Host ""
Write-Host "Laczna liczba plikow: $($allFiles.Count)" -ForegroundColor Cyan

if ($allFiles.Count -eq 0) {
    Write-Host "[UWAGA] Nie znaleziono zadnych plikow! Sprawdz sciezki powyzej." -ForegroundColor Red
    Write-Host ""
    Write-Host "Twoj USERPROFILE = $env:USERPROFILE"
    Write-Host "Zawartosc Desktop:"
    Get-ChildItem "$env:USERPROFILE\Desktop" -ErrorAction SilentlyContinue | Select-Object Name, PSIsContainer | Format-Table
    Write-Host "Zawartosc Documents:"
    Get-ChildItem "$env:USERPROFILE\Documents" -ErrorAction SilentlyContinue | Select-Object Name, PSIsContainer | Format-Table
    Read-Host "Nacisnij Enter aby zamknac"
    exit
}

# --- Zapis do CSV ---
$allFiles | Select-Object `
    @{Name='FullName';  Expression={$_.FullName}}, `
    @{Name='Name';      Expression={$_.Name}}, `
    @{Name='Extension'; Expression={$_.Extension}}, `
    @{Name='SizeKB';    Expression={[math]::Round($_.Length/1KB,1)}}, `
    @{Name='Modified';  Expression={$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm")}} `
| Export-Csv $outFile -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Zapisano do: $outFile" -ForegroundColor Green
Write-Host "Wierszy w CSV: $($allFiles.Count)"
Write-Host ""

# --- Podglad pierwszych 10 wierszy ---
Write-Host "=== Podglad (pierwsze 10) ===" -ForegroundColor Cyan
Import-Csv $outFile | Select-Object -First 10 | Format-Table Name, Extension, SizeKB, Modified -AutoSize

Read-Host "Nacisnij Enter aby zamknac"
