# =============================================================
# Skrypt: scan_files_v2.ps1
# Cel:    Skanowanie Desktop, Documents, Downloads -> CSV
# =============================================================

$outFile = "$env:USERPROFILE\OneDrive\Claude_Projects\Organizacja_projektow\files_inventory.csv"

Write-Host "Skanuje..." -ForegroundColor Cyan

# Jedno wywolanie Get-ChildItem, bezposredni pipe do Export-Csv
Get-ChildItem -Path "$env:USERPROFILE\Desktop","$env:USERPROFILE\Documents","$env:USERPROFILE\Downloads" -Recurse -File -ErrorAction SilentlyContinue |
    Select-Object FullName, Name, Extension,
        @{N='SizeKB';E={[math]::Round($_.Length/1KB,1)}},
        @{N='Modified';E={$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm")}} |
    Export-Csv -Path $outFile -NoTypeInformation -Encoding UTF8

$count = (Import-Csv $outFile).Count
Write-Host "Zapisano $count plikow do: $outFile" -ForegroundColor Green

if ($count -eq 0) {
    Write-Host ""
    Write-Host "0 plikow! Diagnostyka:" -ForegroundColor Red
    Write-Host "USERPROFILE = $env:USERPROFILE"
    @("Desktop","Documents","Downloads") | ForEach-Object {
        $p = Join-Path $env:USERPROFILE $_
        if (Test-Path $p) {
            $n = (Get-ChildItem $p -File -EA SilentlyContinue).Count
            Write-Host "  $_ : $n plikow (bez podfolderow)" -ForegroundColor Yellow
        } else {
            Write-Host "  $_ : NIE ISTNIEJE" -ForegroundColor Red
        }
    }
}

Read-Host "Nacisnij Enter"
