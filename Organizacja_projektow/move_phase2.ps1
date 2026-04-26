# =============================================================
# Skrypt: move_phase2.ps1
# Cel:    Faza 2 — przeniesienie plików + scalenie duplikatów
# Tryb:   $Preview = $true  → tylko podglad (domyslnie)
#         $Preview = $false → faktyczne przeniesienie
# =============================================================

$Preview = $true   # <-- zmien na $false po weryfikacji podgladu

$base     = "C:\Users\jarek\OneDrive\Claude_Projects"
$dl       = "C:\Users\jarek\Downloads"

$moved   = 0
$errors  = 0

function Move-SafeFile {
    param([string]$Source, [string]$Dest)

    if (-not (Test-Path $Source)) {
        Write-Host "  [BRAK] $Source" -ForegroundColor Red
        $script:errors++
        return
    }

    # Utworz folder docelowy jesli nie istnieje
    $destDir = Split-Path $Dest -Parent
    if (-not (Test-Path $destDir)) {
        if ($Preview) {
            Write-Host "  [MKDIR] $destDir" -ForegroundColor DarkYellow
        } else {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
    }

    if ($Preview) {
        Write-Host "  [PODGLAD] $(Split-Path $Source -Leaf)" -ForegroundColor Cyan
        Write-Host "        --> $Dest" -ForegroundColor DarkCyan
    } else {
        try {
            Move-Item -Path $Source -Destination $Dest -Force
            Write-Host "  [OK] $(Split-Path $Source -Leaf)" -ForegroundColor Green
            $script:moved++
        } catch {
            Write-Host "  [BLAD] $($_.Exception.Message)" -ForegroundColor Red
            $script:errors++
        }
    }
}

function Move-SafeFolder {
    param([string]$Source, [string]$DestDir)

    if (-not (Test-Path $Source)) {
        Write-Host "  [BRAK] $Source" -ForegroundColor Red
        $script:errors++
        return
    }

    $files = Get-ChildItem $Source -Recurse -File -EA SilentlyContinue
    foreach ($f in $files) {
        $relativePath = $f.FullName.Substring($Source.Length + 1)
        $destPath = Join-Path $DestDir $relativePath
        Move-SafeFile -Source $f.FullName -Dest $destPath
    }
}

# =============================================================
Write-Host ""
if ($Preview) {
    Write-Host "=== TRYB PODGLADU === (nic nie zostanie przeniesione)" -ForegroundColor Yellow
} else {
    Write-Host "=== TRYB WYKONANIA === (pliki beda przenoszone!)" -ForegroundColor Red
}
Write-Host ""

# --- 1. Przeniesienia z Downloads ---
Write-Host "--- 1. Przeniesienia z Downloads ---" -ForegroundColor White

Write-Host "`n[MusicXML]" -ForegroundColor Magenta
Move-SafeFile `
    -Source "$dl\filex  mxml viewer player.zip" `
    -Dest   "$base\MusicXML\notes\filex_mxml_viewer_player.zip"

Write-Host "`n[BRAG_bonus_25]" -ForegroundColor Magenta
Move-SafeFile `
    -Source "$dl\Personal Documents\Opinia_Prawna_Premia_2025_Lach.docx" `
    -Dest   "$base\BRAG_bonus_25\inputs\Opinia_Prawna_Premia_2025_Lach.docx"

Write-Host "`n[Claude_setupfiles]" -ForegroundColor Magenta
Move-SafeFile `
    -Source "$dl\Znajdz-zablokowane-pliki.ps1" `
    -Dest   "$base\Claude_setupfiles\notes\Znajdz-zablokowane-pliki.ps1"

Write-Host "`n[Steuer_2025 - Finance]" -ForegroundColor Magenta
Move-SafeFolder `
    -Source  "$dl\Finance" `
    -DestDir "$base\Steuer_2025\inputs\Finance"

# --- 2. Scalenie duplikatow ---
Write-Host "`n--- 2. Scalenie duplikatow ---" -ForegroundColor White

# Tlumaczenie_Ani -> Tłumaczenie_Ani
Write-Host "`n[Tlumaczenie_Ani -> Tlumaczenie_Ani (z polskimi znakami)]" -ForegroundColor Magenta
$srcTlum = "$base\Tlumaczenie_Ani"
$dstTlum = "$base\Tłumaczenie_Ani"
if (Test-Path $srcTlum) {
    # Przenosimy inputs
    $inputFiles = Get-ChildItem "$srcTlum\inputs" -File -EA SilentlyContinue
    foreach ($f in $inputFiles) {
        Move-SafeFile -Source $f.FullName -Dest "$dstTlum\inputs\$($f.Name)"
    }
    # Przenosimy outputs
    $outputFiles = Get-ChildItem "$srcTlum\outputs" -File -EA SilentlyContinue
    foreach ($f in $outputFiles) {
        Move-SafeFile -Source $f.FullName -Dest "$dstTlum\outputs\$($f.Name)"
    }
    # Usun stary folder
    if (-not $Preview) {
        try {
            Remove-Item $srcTlum -Recurse -Force
            Write-Host "  [USUNIETY] $srcTlum" -ForegroundColor Green
        } catch {
            Write-Host "  [BLAD usuwania] $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [PODGLAD] Usunie folder: $srcTlum" -ForegroundColor DarkYellow
    }
}

# Riemann_Zeta (pusty) -> usun
Write-Host "`n[Riemann_Zeta (pusty) -> usun]" -ForegroundColor Magenta
$srcRiem = "$base\Riemann_Zeta"
if (Test-Path $srcRiem) {
    if (-not $Preview) {
        try {
            Remove-Item $srcRiem -Recurse -Force
            Write-Host "  [USUNIETY] $srcRiem" -ForegroundColor Green
        } catch {
            Write-Host "  [BLAD usuwania] $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [PODGLAD] Usunie folder: $srcRiem" -ForegroundColor DarkYellow
    }
}

# --- Podsumowanie ---
Write-Host "`n--- Podsumowanie ---" -ForegroundColor White
if ($Preview) {
    Write-Host "Tryb podgladu — nic nie zostalo zmienione." -ForegroundColor Yellow
    Write-Host "Aby wykonac: zmien `$Preview = `$false na poczatku skryptu i uruchom ponownie." -ForegroundColor Yellow
} else {
    Write-Host "Przeniesiono plikow: $moved" -ForegroundColor Green
    Write-Host "Bledow: $errors" -ForegroundColor $(if ($errors -gt 0) {'Red'} else {'Green'})
}

Write-Host ""
Read-Host "Nacisnij Enter"
