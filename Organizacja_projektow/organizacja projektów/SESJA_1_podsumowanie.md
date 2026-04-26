# Organizacja plików — Sesja 1: Podsumowanie i wnioski

**Data:** 16 kwietnia 2026
**Kontekst:** Faza 2 projektu organizacji Claude_Projects — przenoszenie plików z Downloads do struktury na OneDrive

---

## Co zostało zrobione

Przygotowano skrypt PowerShell (`move_downloads.ps1`) do automatycznego przeniesienia ~50 plików z `C:\Users\jarek\Downloads` do odpowiednich podfolderów w `C:\Users\jarek\OneDrive\Claude_Projects`.

Skrypt obsługuje 9 projektów (z ~25 istniejących):

| Projekt | Typ plików | Cel (podfolder) |
|---------|-----------|-----------------|
| Jarek_w_BRUGG | Protokoll Call Pablo_Jarek | inputs/ |
| Tlumaczenie_Ani | wegela PDFs, glosariusz, tłumaczenia .md | inputs/ + outputs/ |
| MusicXML | MuseScore, Guitar Pro, tabulatury PDF, MusicBee, mxml viewer | inputs/ + notes/ |
| Ubezpieczenie_BMW430 | AXA dokumenty, checklista porównanie | inputs/ |
| Riemann_Function_Zeta | Visualizer HTML, zeta-riemann | outputs/ |
| BRUGG_PowerPoint_template | Template V2, extract_layouts, potx_analysis | outputs/ + notes/ |
| Steuer_2025 | Steuererklärung, WErtschriften | inputs/ |
| pipe_pressure_loss_diag | straty_cisnienia_PEX, pipe_pressure_loss_calculator | outputs/ |
| Claude_setupfiles | WebExtension Launcher, Create_Projects_Structure, feedback | inputs/ + outputs/ + notes/ |

Pliki celowo pozostawione w Downloads: zdjęcia prywatne (Wielkanoc Piechotki, WhatsApp Image), Gemini_Generated_Image, Znajdz-zablokowane-pliki.ps1, oraz starsze foldery zbiorcze (Misc, Equipment, Finance, Personal Documents, Music - Audio, Installers, Scans & Photos).

## Status skryptu

Skrypt `move_downloads.ps1` jest zapisany w `Claude_Projects\Organizacja_projektow\`.
Domyślnie działa w trybie podglądu ($Preview = $true) — wyświetla co by przeniósł, ale nic nie rusza.
Po weryfikacji podglądu: zmienić $Preview na $false i uruchomić ponownie.

Komenda do uruchomienia w PowerShell:
```
& "C:\Users\jarek\OneDrive\Claude_Projects\Organizacja_projektow\move_downloads.ps1"
```

---

## Co pozostało do zrobienia (Faza 2 — kontynuacja)

Projekty bez przypisanych plików w Downloads — mogą mieć pliki w innych lokalizacjach (Desktop, Documents, inne foldery OneDrive):

1. RK_Infra
2. IZOTEROM_SRL
3. BRAG_audit
4. BRAG_bonus_25
5. PEMA
6. SECO_2026
7. UNOPS_Kharkiv
8. Golan_MoU_Patent
9. DBDH_delegation_2026
10. ORADEA_03_2026
11. Patent_riPEX
12. powerpoint_strategy_DH
13. BMW_430
14. tekst_Ani
15. Ukraine_perspektywy
16. regression_riPEX (osobny od pipe_pressure_loss_diag — sprawdzić czy pliki straty_cisnienia powinny iść tu)
17. Riemann_Zeta (osobny folder od Riemann_Function_Zeta — wyjaśnić relację)

Dodatkowe zadania: wypełnić README w każdym projekcie, zaktualizować INDEX.md, ustalić reguły archiwizacji.

---

## Czego się nauczyliśmy — wnioski operacyjne

### 1. Kontrola ekranu (computer-use) nie nadaje się do masowego przenoszenia plików

Próba przenoszenia 55+ plików przez klikanie w Eksploratorze byłaby nieefektywna. Skrypt PowerShell to jedyna sensowna metoda dla tej skali. Odkryliśmy też ograniczenia: Terminal/PowerShell ma w Cowork tier "click" (można klikać, ale nie wpisywać tekstu), więc Claude nie może bezpośrednio uruchomić skryptu. Rozwiązanie: zapisać skrypt jako plik .ps1 przez Cowork file system, użytkownik uruchamia ręcznie.

### 2. Katalogowanie plików przez screenshoty jest wolne i niedokładne

Odczytywanie nazw plików ze screenshotów Eksploratora jest podatne na błędy (obcięte nazwy, niejasne rozszerzenia). Przy następnej sesji lepiej od razu uruchomić komendę PowerShell, która wylistuje pliki z pełnymi ścieżkami, a następnie wkleić wynik do Cowork.

### 3. AskUserQuestion na początku oszczędza czas

Pytania o decyzje (dokąd przenoszę niejednoznaczne pliki, co zostawić) powinny paść jak najwcześniej. Nie zgadujemy — pytamy.

---

## Konkretny plan na Sesję 2

### Przygotowanie (przed sesją)

1. **Uruchomić skrypt z Sesji 1** — jeśli jeszcze nie uruchomiony, wykonać podgląd i potem przeniesienie.
2. **Przygotować listę plików do przeniesienia** — dla każdego z pozostałych projektów sprawdzić, czy są pliki na Desktop, w Documents, lub w innych folderach. Można to zrobić komendą PowerShell:
```powershell
# Uruchom w PowerShell i skopiuj wynik do Cowork
Get-ChildItem "C:\Users\jarek\Desktop","C:\Users\jarek\Documents" -Recurse -File |
    Select-Object FullName, Length, LastWriteTime |
    Export-Csv "C:\Users\jarek\OneDrive\Claude_Projects\Organizacja_projektow\files_inventory.csv" -NoTypeInformation -Encoding UTF8
```
To da Cowork precyzyjną listę plików bez konieczności czytania screenshotów.

### Przebieg sesji 2

1. **Zamontować folder Claude_Projects** (nie Organizacja_projektow) — daje dostęp do pełnej struktury.
2. **Załadować ten dokument** — jako kontekst dla Claude.
3. **Załadować files_inventory.csv** — jeśli przygotowany wcześniej.
4. **Ustalić mapowanie** — Claude przygotuje kolejny skrypt PowerShell, analogicznie do Sesji 1.
5. **Podgląd → weryfikacja → wykonanie** — ten sam dwuprzebiegowy schemat.

### Kluczowe kroki które się sprawdziły

- Weryfikacja struktury docelowej w Eksploratorze (computer-use) — szybkie, daje pewność że foldery istnieją.
- AskUserQuestion do wszystkich niejednoznacznych przypisań — jedno pytanie z wieloma pozycjami.
- Skrypt z trybem podglądu ($Preview = $true/$false) — bezpieczny, przejrzysty, powtarzalny.
- Zapis skryptu bezpośrednio do OneDrive przez Cowork file system — obchodzi ograniczenie tier "click" na Terminalu.

### Czego unikać

- Nie próbować przenosić plików przez computer-use (klikanie w Eksploratorze) — skrypt jest 100x szybszy.
- Nie czytać nazw plików ze screenshotów gdy można mieć CSV lub dir listing.
- Nie zakładać rozszerzeń plików — używać wildcardów (*) na końcu nazwy.

---

*Dokument wygenerowany: 16 kwietnia 2026, Sesja Cowork "organizacja projektów"*
