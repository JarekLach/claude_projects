# ============================================================
# SKRYPT: Przenoszenie plików z Downloads do Claude_Projects
# Data: 2026-04-16
# Autor: Claude (dla Jarka)
# ============================================================
# KROK 1: Uruchom ten skrypt — zobaczysz PODGLĄD (nic nie zostanie przeniesione)
# KROK 2: Jeśli wszystko się zgadza, zmień $Preview na $false i uruchom ponownie
# ============================================================

$Preview = $false   # <-- ZMIEŃ NA $false ŻEBY PRZENOSIĆ PLIKI

$dl = "C:\Users\jarek\Downloads"
$cp = "C:\Users\jarek\OneDrive\Claude_Projects"

$moved = 0
$notFound = 0
$errors = 0

function Move-To {
    param(
        [string]$Pattern,
        [string]$Destination
    )

    $items = @(Get-ChildItem -Path $Pattern -ErrorAction SilentlyContinue)

    if ($items.Count -eq 0) {
        Write-Host "  [NIE ZNALEZIONO] $Pattern" -ForegroundColor DarkYellow
        $script:notFound++
        return
    }

    if (!(Test-Path $Destination)) {
        if (!$Preview) {
            New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        }
    }

    foreach ($item in $items) {
        if ($Preview) {
            Write-Host "  [PODGLAD] $($item.Name)" -ForegroundColor Cyan -NoNewline
            Write-Host " -> $Destination" -ForegroundColor DarkGray
        } else {
            try {
                Move-Item -Path $item.FullName -Destination $Destination -Force
                Write-Host "  [OK] $($item.Name)" -ForegroundColor Green -NoNewline
                Write-Host " -> $Destination" -ForegroundColor DarkGray
            } catch {
                Write-Host "  [BLAD] $($item.Name): $_" -ForegroundColor Red
                $script:errors++
            }
        }
        $script:moved++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor White
if ($Preview) {
    Write-Host "  TRYB PODGLADU - nic nie zostanie przeniesione" -ForegroundColor Yellow
} else {
    Write-Host "  TRYB WYKONANIA - pliki beda przenoszone!" -ForegroundColor Red
}
Write-Host "============================================" -ForegroundColor White
Write-Host ""

# ----------------------------------------------------------
# 1. JAREK_W_BRUGG
# ----------------------------------------------------------
Write-Host "--- Jarek_w_BRUGG ---" -ForegroundColor Magenta
Move-To "$dl\Protokoll Call Pablo_Jarek 20260410*" "$cp\Jarek_w_BRUGG\inputs"

# ----------------------------------------------------------
# 2. TLUMACZENIE_ANI (Wegela translations)
# ----------------------------------------------------------
Write-Host "--- Tlumaczenie_Ani ---" -ForegroundColor Magenta

Move-To "$dl\kk wegela*immeasurables PL trans AI*" "$cp\Tlumaczenie_Ani\inputs"
Move-To "$dl\kk wegela*immeasurables opti*" "$cp\Tlumaczenie_Ani\inputs"

$wegelaPlain = Get-ChildItem "$dl\kk wegela*4 immeasurables*" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch "opti|PL trans" }
foreach ($f in $wegelaPlain) {
    if ($Preview) {
        Write-Host "  [PODGLAD] $($f.Name)" -ForegroundColor Cyan -NoNewline
        Write-Host " -> $cp\Tlumaczenie_Ani\inputs" -ForegroundColor DarkGray
    } else {
        Move-Item $f.FullName "$cp\Tlumaczenie_Ani\inputs" -Force
        Write-Host "  [OK] $($f.Name)" -ForegroundColor Green -NoNewline
        Write-Host " -> $cp\Tlumaczenie_Ani\inputs" -ForegroundColor DarkGray
    }
    $moved++
}

Move-To "$dl\wegela_ch9-12_pl*" "$cp\Tlumaczenie_Ani\outputs"
Move-To "$dl\glosariusz four immeasurables*" "$cp\Tlumaczenie_Ani\outputs"
Move-To "$dl\wegela_four_immeasurables_ch9-12*" "$cp\Tlumaczenie_Ani\outputs"

# ----------------------------------------------------------
# 3. MUSICXML (sheets, tabs, tools)
# ----------------------------------------------------------
Write-Host "--- MusicXML ---" -ForegroundColor Magenta

Move-To "$dl\heartbeats-jose-gonzalez*" "$cp\MusicXML\inputs"
Move-To "$dl\father-and-son-lead-sheet-with-lyrics*" "$cp\MusicXML\inputs"
Move-To "$dl\father-and-son-cat-stevens*" "$cp\MusicXML\inputs"
Move-To "$dl\shape-of-my-heart-lead-sheet-with-lyrics*" "$cp\MusicXML\inputs"

Move-To "$dl\Coldplay - A Rush Of Blood To The Head*" "$cp\MusicXML\inputs"
Move-To "$dl\Coldplay - X And Y*" "$cp\MusicXML\inputs"
Move-To "$dl\a rush of blood to the head chords*" "$cp\MusicXML\inputs"
Move-To "$dl\x and y tab*" "$cp\MusicXML\inputs"
Move-To "$dl\yellow-coldplay*" "$cp\MusicXML\inputs"

Move-To "$dl\(1) OFFICIAL A RUSH OF BLOOD*" "$cp\MusicXML\inputs"
Move-To "$dl\OFFICIAL A MESSAGE TABS*" "$cp\MusicXML\inputs"

Move-To "$dl\MusicBee37_Patched*" "$cp\MusicXML\notes"
Move-To "$dl\musicxml-viewer*" "$cp\MusicXML\notes"
Move-To "$dl\filex*mxml viewer player" "$cp\MusicXML\notes"
Move-To "$dl\.mscbackup" "$cp\MusicXML\notes"
Move-To "$dl\Music - Sheets & Scores" "$cp\MusicXML\inputs"

# ----------------------------------------------------------
# 4. UBEZPIECZENIE_BMW430
# ----------------------------------------------------------
Write-Host "--- Ubezpieczenie_BMW430 ---" -ForegroundColor Magenta
Move-To "$dl\AXA_Starkowska-Lach_Anna*" "$cp\Ubezpieczenie_BMW430\inputs"
Move-To "$dl\checklista_porownanie_ubezpieczen*" "$cp\Ubezpieczenie_BMW430\inputs"

# ----------------------------------------------------------
# 5. RIEMANN_FUNCTION_ZETA
# ----------------------------------------------------------
Write-Host "--- Riemann_Function_Zeta ---" -ForegroundColor Magenta
Move-To "$dl\Riemann_Zeta_Visualizer*" "$cp\Riemann_Function_Zeta\outputs"
Move-To "$dl\zeta-riemann*" "$cp\Riemann_Function_Zeta\outputs"
Move-To "$dl\zeta_riemann*" "$cp\Riemann_Function_Zeta\outputs"
Move-To "$dl\zeta*riemann*" "$cp\Riemann_Function_Zeta\outputs"

# ----------------------------------------------------------
# 6. BRUGG_POWERPOINT_TEMPLATE
# ----------------------------------------------------------
Write-Host "--- BRUGG_PowerPoint_template ---" -ForegroundColor Magenta
Move-To "$dl\BRUGG_Pipes_Template V2*" "$cp\BRUGG_PowerPoint_template\outputs"
Move-To "$dl\BRUGG_Pipes_Template_V2*" "$cp\BRUGG_PowerPoint_template\outputs"
Move-To "$dl\extract_layouts*" "$cp\BRUGG_PowerPoint_template\notes"
Move-To "$dl\_potx_analysis*" "$cp\BRUGG_PowerPoint_template\notes"
Move-To "$dl\extract_potx*" "$cp\BRUGG_PowerPoint_template\notes"
Move-To "$dl\_potx_extracted" "$cp\BRUGG_PowerPoint_template\notes"

# ----------------------------------------------------------
# 7. STEUER_2025
# ----------------------------------------------------------
Write-Host "--- Steuer_2025 ---" -ForegroundColor Magenta
Move-To "$dl\WErtschriften Steuererklarung 2025*" "$cp\Steuer_2025\inputs"
Move-To "$dl\WErtschriften Steuererkl*rung 2025*" "$cp\Steuer_2025\inputs"
Move-To "$dl\Steuererkl*rung 2025*" "$cp\Steuer_2025\inputs"

# ----------------------------------------------------------
# 8. PIPE_PRESSURE_LOSS_DIAG
# ----------------------------------------------------------
Write-Host "--- pipe_pressure_loss_diag ---" -ForegroundColor Magenta
Move-To "$dl\straty_cisnienia_PEX*" "$cp\pipe_pressure_loss_diag\outputs"
Move-To "$dl\pipe_pressure_loss_calculator*" "$cp\pipe_pressure_loss_diag\outputs"

# ----------------------------------------------------------
# 9. CLAUDE_SETUPFILES
# ----------------------------------------------------------
Write-Host "--- Claude_setupfiles ---" -ForegroundColor Magenta
Move-To "$dl\Claude_WebExtension_Launcher*" "$cp\Claude_setupfiles\inputs"
Move-To "$dl\Create_Claude_Projects_Structure*" "$cp\Claude_setupfiles\outputs"
Move-To "$dl\feedback.json" "$cp\Claude_setupfiles\notes"

# ----------------------------------------------------------
# PODSUMOWANIE
# ----------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor White
Write-Host "  PODSUMOWANIE:" -ForegroundColor White
Write-Host "  Pliki do przeniesienia: $moved" -ForegroundColor Cyan
Write-Host "  Nie znalezione:         $notFound" -ForegroundColor Yellow
Write-Host "  Bledy:                  $errors" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor White
Write-Host ""

if ($Preview) {
    Write-Host "To byl PODGLAD. Aby przeniesc pliki:" -ForegroundColor Yellow
    Write-Host '  Zmien $Preview = $true na $Preview = $false' -ForegroundColor Yellow
    Write-Host "  i uruchom skrypt ponownie." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pliki POZOSTAWIONE w Downloads (zgodnie z decyzja):" -ForegroundColor DarkGray
Write-Host "  - Wielkanoc Piechotki 2026*.jpg" -ForegroundColor DarkGray
Write-Host "  - WhatsApp Image 2026-03-23*.jpg" -ForegroundColor DarkGray
Write-Host "  - Gemini_Generated_Image*.png" -ForegroundColor DarkGray
Write-Host "  - Znajdz-zablokowane-pliki.ps1" -ForegroundColor DarkGray
Write-Host "  - Foldery: Misc, Equipment, Finance, Personal Documents," -ForegroundColor DarkGray
Write-Host "    Music - Audio, Installers, Scans & Photos" -ForegroundColor DarkGray
