# ============================================================================
# Claude Projects — Skrypt tworzenia struktury folderów
# Miejsce docelowe: OneDrive/Claude_Projects
# ============================================================================

# Zdefiniuj ścieżkę OneDrive Personal (standardowa dla Windows 11)
$oneDrivePath = "$env:USERPROFILE\OneDrive"
$projectsPath = "$oneDrivePath\Claude_Projects"

# Sprawdzenie, czy OneDrive istnieje
if (-not (Test-Path $oneDrivePath)) {
    Write-Host "❌ BŁĄD: Folder OneDrive nie znaleziony: $oneDrivePath" -ForegroundColor Red
    Write-Host "Sprawdź, czy OneDrive jest zainstalowany i skonfigurowany." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ OneDrive znaleziony: $oneDrivePath" -ForegroundColor Green

# Główna struktura folderów
$folders = @(
    "$projectsPath",
    "$projectsPath\templates",
    "$projectsPath\_archive",
    "$projectsPath\Riemann_Zeta\inputs",
    "$projectsPath\Riemann_Zeta\outputs",
    "$projectsPath\Riemann_Zeta\notes"
)

# Utwórz wszystkie foldery
Write-Host "`n📁 Tworzenie folderów..." -ForegroundColor Cyan
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✓ $folder" -ForegroundColor Green
    } else {
        Write-Host "  ~ (już istnieje) $folder" -ForegroundColor Yellow
    }
}

# Szablony plików
$projectReadmeTemplate = @"
# Projekt: [NAZWA PROJEKTU]

## Podstawowe informacje

**Data utworzenia:** [DATA]  
**Status:** [AKTYWNY / WSTRZYMANY / ZAKOŃCZONY]  
**Cel:** [KRÓTKI OPIS CELU]

## Zawartość folderów

- `inputs/` — pliki wejściowe, dane, załączniki z czata
- `outputs/` — finalne dokumenty, raporty, kalkulatory
- `notes/` — notatki robocze, wersje robocze

## Przebieg pracy

| Data | Etap | Status |
|------|------|--------|
| [DATA] | [ETAP] | [STATUS] |

## Uwagi

[TUTAJ DODAJ UWAGI DOTYCZĄCE PROJEKTU]

## Pliki końcowe

- [NAZWA PLIKU] — [OPIS]

---
*Ostatnia aktualizacja: [DATA]*
"@

$mainIndex = @"
# Claude Projects — Indeks

Centralny katalog wszystkich projektów z czatów Claude. Każdy projekt ma swój podfolder z dokumentami, danymi i notatkami.

Lokalizacja: **OneDrive/Claude_Projects/**

## Aktywne projekty

| Projekt | Folder | Status | Data Start | Ostatnia zmiana |
|---------|--------|--------|------------|-----------------|
| Riemann Zeta Visualizer | `Riemann_Zeta/` | AKTYWNY | 2026-04-16 | 2026-04-16 |

## Struktura folderów

``````
Claude_Projects/
├── INDEX.md                    — główny indeks projektu
├── templates/                  — szablony (README, struktury)
├── _archive/                   — zarchiwizowane projekty
└── Riemann_Zeta/
    ├── inputs/                 — dane wejściowe
    ├── outputs/                — finalne pliki
    ├── notes/                  — notatki robocze
    └── README.md               — opis projektu
``````

## Jak dodać nowy projekt

1. Utwórz folder z nazwą projektu w `Claude_Projects/`
2. Wewnątrz utwórz podfoldery: `inputs/`, `outputs/`, `notes/`
3. Skopiuj `templates/PROJECT_README.md` do folderu projektu
4. Dodaj wpis w tabelce wyżej
5. Rozpocznij pracę

## Zasady organizacji

- **Finalne pliki** → `outputs/`
- **Dane wejściowe** → `inputs/`
- **Wersje robocze** → `notes/`
- **Archiwum** → przenieś do `_archive/` gdy projekt się skończy

## Synchronizacja

Cały folder jest przechowywany na OneDrive i automatycznie synchronizowany na wszystkie Twoje urządzenia.

---
*Data utworzenia: 16 kwietnia 2026*
*OneDrive: $(Split-Path -Leaf $oneDrivePath)*
"@

$riemannReadme = @"
# Projekt: Riemann Zeta Visualizer

## Podstawowe informacje

**Data utworzenia:** 2026-04-16  
**Status:** AKTYWNY  
**Cel:** Interaktywna wizualizacja funkcji Zeta Riemanna — eksploracja własności matematycznych i wizualne reprezentacje zer, części rzeczywistej i urojonej.

## Zawartość folderów

- `inputs/` — materiały matematyczne, specyfikacje, dane wejściowe
- `outputs/` — finalne wizualizacje HTML, dokumentacja, raporty
- `notes/` — notatki robocze, wersje testowe, pomysły

## Pliki projektu

### Outputs
- `Riemann_Zeta_Visualizer.html` — główna interaktywna wizualizacja

## Zainteresowania i kontekst

- Złożona analiza i teoria funkcji
- Wizualizacja danych matematycznych
- Hipoteza Riemanna i zera funkcji
- Edukacja i popularyzacja matematyki

## Przebieg pracy

| Data | Etap | Status |
|------|------|--------|
| 2026-04-16 | Utworzenie struktury projektu | Ukończone |
| TBD | Rozszerzenie wizualizacji | Planowane |

## Notatki

Projekt łączy zainteresowania matematyczne z programowaniem wizualizacyjnym. Wizualizator pokazuje:
- Wykres funkcji Zeta w płaszczyźnie zespolonej
- Części rzeczywistą i urojoną
- Zera funkcji (Critical Strip)
- Interaktywne zbliżanie i parametry

---
*Ostatnia aktualizacja: 16 kwietnia 2026*
"@

# Utwórz pliki
Write-Host "`n📄 Tworzenie plików szablonów..." -ForegroundColor Cyan

$files = @{
    "$projectsPath\INDEX.md" = $mainIndex
    "$projectsPath\templates\PROJECT_README.md" = $projectReadmeTemplate
    "$projectsPath\Riemann_Zeta\README.md" = $riemannReadme
}

foreach ($filePath in $files.Keys) {
    if (-not (Test-Path $filePath)) {
        Set-Content -Path $filePath -Value $files[$filePath] -Encoding UTF8
        Write-Host "  ✓ $(Split-Path -Leaf $filePath)" -ForegroundColor Green
    } else {
        Write-Host "  ~ (już istnieje) $(Split-Path -Leaf $filePath)" -ForegroundColor Yellow
    }
}

# Podsumowanie
Write-Host "`n✅ STRUKTURĘ GOTOWA!" -ForegroundColor Green
Write-Host "`nLokalizacja: $projectsPath" -ForegroundColor Cyan
Write-Host "`nMożesz teraz otworzyć ten folder w Explorerze:" -ForegroundColor White
Write-Host "  explorer `"$projectsPath`"" -ForegroundColor Yellow

Write-Host "`nFolders created:" -ForegroundColor Cyan
Get-ChildItem -Path $projectsPath -Recurse -Directory | ForEach-Object {
    $level = ($_.FullName.Replace($projectsPath, '').Split('\') | Measure-Object).Count - 1
    $indent = '  ' * $level
    Write-Host "$indent├─ $($_.Name)" -ForegroundColor Gray
}

Write-Host "`nFiles created:" -ForegroundColor Cyan
Get-ChildItem -Path $projectsPath -Recurse -File | ForEach-Object {
    $level = ($_.FullName.Replace($projectsPath, '').Split('\') | Measure-Object).Count - 1
    $indent = '  ' * $level
    Write-Host "$indent├─ $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n✓ Skrypt wykonany pomyślnie!" -ForegroundColor Green
