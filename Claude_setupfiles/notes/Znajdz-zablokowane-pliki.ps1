# --- Znajdowanie plików z zablokowanym podglądem (Mark of the Web) ---
# Skrypt skanuje folder Downloads i podfoldery, szukając plików
# z alternatywnym strumieniem Zone.Identifier (MOTW).

$folder = [Environment]::GetFolderPath("UserProfile") + "\Downloads"

if (-Not (Test-Path $folder)) {
    Write-Host "Folder nie istnieje: $folder" -ForegroundColor Red
    exit
}

Write-Host "`nSkanowanie folderu: $folder" -ForegroundColor Cyan
Write-Host "Szukam plikow z Mark of the Web (Zone.Identifier)...`n" -ForegroundColor Yellow

$blocked = @()

$files = Get-ChildItem -Path $folder -Recurse -File -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $streams = Get-Item -Path $file.FullName -Stream * -ErrorAction SilentlyContinue
    if ($streams.Stream -contains "Zone.Identifier") {
        $zoneContent = Get-Content -Path $file.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue
        $blocked += [PSCustomObject]@{
            Plik      = $file.FullName.Replace($folder + "\", "")
            Rozmiar   = if ($file.Length -gt 1MB) { "{0:N1} MB" -f ($file.Length / 1MB) }
                        elseif ($file.Length -gt 1KB) { "{0:N1} KB" -f ($file.Length / 1KB) }
                        else { "$($file.Length) B" }
            Zrodlo    = ($zoneContent | Where-Object { $_ -match "^ReferrerUrl=" }) -replace "^ReferrerUrl=", ""
            ZoneId    = ($zoneContent | Where-Object { $_ -match "^ZoneId=" }) -replace "^ZoneId=", ""
        }
    }
}

if ($blocked.Count -eq 0) {
    Write-Host "Nie znaleziono zablokowanych plikow." -ForegroundColor Green
} else {
    Write-Host "Znaleziono $($blocked.Count) zablokowanych plikow:`n" -ForegroundColor Red

    $blocked | Format-Table -AutoSize -Wrap

    Write-Host "`n--- Legenda ZoneId ---" -ForegroundColor DarkGray
    Write-Host "0 = Komputer lokalny, 1 = Intranet, 2 = Zaufane, 3 = Internet, 4 = Niebezpieczne" -ForegroundColor DarkGray

    $answer = Read-Host "`nCzy chcesz odblokowac wszystkie znalezione pliki? (t/n)"
    if ($answer -eq "t") {
        foreach ($item in $blocked) {
            $fullPath = Join-Path $folder $item.Plik
            try {
                Unblock-File -Path $fullPath
                Write-Host "Odblokowano: $($item.Plik)" -ForegroundColor Green
            } catch {
                Write-Host "Blad: $($item.Plik)" -ForegroundColor Red
            }
        }
        Write-Host "`nGotowe!" -ForegroundColor Cyan
    } else {
        Write-Host "Anulowano." -ForegroundColor Yellow
    }
}

Write-Host "`nNacisnij Enter, aby zakonczyc..." -ForegroundColor DarkGray
Read-Host
