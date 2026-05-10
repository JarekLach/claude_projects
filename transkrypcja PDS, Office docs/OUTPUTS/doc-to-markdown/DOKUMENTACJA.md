# Konwersja dokumentów do Markdown — dokumentacja

## Zadanie

Zbudowanie lokalnego zestawu narzędzi do masowej konwersji dokumentów różnych formatów (PDF, DOCX, PPTX, XLSX i inne) do formatu Markdown, bez udziału chmury i bez zużycia tokenów API. Skrypty mają działać w folderze, z którego zostały wywołane, i zapisywać wyniki obok plików źródłowych.

Dodatkowy wymóg: obsługa skanowanych PDF bez warstwy tekstowej (OCR).

---

## Środowisko

- System: Windows 11
- PowerShell 5.1 lub nowszy
- Python 3.12 (dla pakietów ML — marker-pdf nie obsługuje Python 3.14)
- Python 3.14 (zainstalowany domyślnie, używany przez mid.ps1, mupdf.ps1, ocr.ps1)

Launcher `py` pozwala uruchamiać konkretną wersję: `py -3.12 skrypt.py`.

---

## Wybrane narzędzia

### MarkItDown

Biblioteka i CLI Microsoftu do konwersji dokumentów biurowych i PDF do Markdown. Obsługuje najszerszy zakres formatów: PDF, DOCX, PPTX, XLSX, HTML, CSV, XML, JSON, TXT, RTF. Działa lokalnie, nie wymaga GPU. Ekstrakcja tekstu — nie OCR.

Instalacja:

```
pip install markitdown
```

### PyMuPDF4LLM

Biblioteka do wysokiej jakości ekstrakcji tekstu z PDF, zoptymalizowana pod kątem podawania wyników do modeli językowych. Lepiej niż MarkItDown zachowuje strukturę wielokolumnowych dokumentów technicznych. Tylko PDF. Nie OCR.

Instalacja:

```
pip install pymupdf4llm
```

### Tesseract OCR + pytesseract

Klasyczny silnik OCR (open source, Apache 2.0). Obsługuje ponad 100 języków, w tym polski (pol), ukraiński (ukr), niemiecki (deu), angielski (eng), rumuński (ron). Szybki na CPU. Dobry dla czystych, jednokolumnowych skanów. Markdown wyjściowy to czysty tekst z podziałem na strony.

Instalacja:

```
winget install UB-Mannheim.TesseractOCR
pip install pytesseract pymupdf pillow
```

Weryfikacja zainstalowanych języków: `tesseract --list-langs`

### Marker

Pipeline deep learning (surya-ocr + torch + transformers) do konwersji PDF do Markdown z zachowaniem pełnej struktury: tabele, nagłówki, układ wielokolumnowy. Znacznie lepsza jakość niż Tesseract przy złożonych layoutach. Wymaga Python 3.12. Na CPU Intel (bez NVIDIA CUDA) wolny — kilkadziesiąt sekund na stronę. Pobiera modele przy pierwszym uruchomieniu (~2–4 GB).

Instalacja (Python 3.12):

```
py -3.12 -m pip install marker-pdf
```

---

## Skrypty

Wszystkie skrypty umieszczone w folderze narzędziowym. Kopiować do folderu roboczego przed użyciem lub dodać folder narzędziowy do PATH.

### mid.ps1 — MarkItDown, wiele formatów

Przetwarza wszystkie obsługiwane pliki w bieżącym folderze lub jeden wskazany plik.

```powershell
.\mid.ps1                        # wszystkie obsługiwane pliki
.\mid.ps1 -File oferta.docx      # jeden plik
.\mid.ps1 -Overwrite             # nadpisz istniejące .md
```

Obsługiwane rozszerzenia: `.pdf .docx .pptx .xlsx .html .htm .csv .xml .json .txt .rtf`

### mupdf.ps1 — PyMuPDF4LLM, PDF

Tylko pliki PDF. Lepsza jakość dla dokumentów technicznych z tabelami i wielokolumnowym układem.

```powershell
.\mupdf.ps1                      # wszystkie PDF
.\mupdf.ps1 -File raport.pdf     # jeden plik
.\mupdf.ps1 -Overwrite
```

### ocr.ps1 — Tesseract OCR, skany PDF

Dla skanowanych PDF bez warstwy tekstowej. Renderuje każdą stronę jako obraz (300 DPI), następnie przepuszcza przez Tesseract. Wynik zawiera podział na strony (`## Strona N`).

```powershell
.\ocr.ps1                                  # wszystkie PDF, język pol+eng
.\ocr.ps1 -File skan.pdf                   # jeden plik
.\ocr.ps1 -Lang "pol"                      # tylko polski
.\ocr.ps1 -Lang "pol+ukr+deu+eng+ron"      # pięć języków jednocześnie
.\ocr.ps1 -Dpi 400                         # wyższa jakość dla słabych skanów
.\ocr.ps1 -TesseractPath "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

Jeśli Tesseract nie jest w PATH, skrypt szuka automatycznie pod domyślną ścieżką instalacji. Parametr `-TesseractPath` jako fallback.

### marker.ps1 — Marker, skany i złożone PDF

Dla skanów i dokumentów z tabelami gdzie jakość jest ważniejsza niż szybkość. Wywołuje `marker_single.exe` z Python 3.12. Domyślnie pokazuje output (postęp pobierania modeli, logi konwersji). Parametr `-Quiet` wycisza.

```powershell
.\marker.ps1                     # wszystkie PDF
.\marker.ps1 -File raport.pdf    # jeden plik
.\marker.ps1 -Overwrite
.\marker.ps1 -Quiet              # bez logów
```

Przy pierwszym uruchomieniu pobiera modele (~2–4 GB) — raz, potem offline.

---

## Kiedy które narzędzie

| Sytuacja                                       | Narzędzie     | Skrypt     |
| ---------------------------------------------- | ------------- | ---------- |
| Mix formatów (DOCX, XLSX, PPTX, PDF)           | MarkItDown    | mid.ps1    |
| PDF techniczny, tabele, wiele kolumn           | PyMuPDF4LLM   | mupdf.ps1  |
| Skan — prosty tekst, jedna kolumna             | Tesseract OCR | ocr.ps1    |
| Skan — tabele, złożony layout, jakość kluczowa | Marker        | marker.ps1 |

Żadne z narzędzi nie obsługuje OCR na odręcznym piśmie. Marker i Tesseract działają wyłącznie na plikach PDF.

---

## Uwagi eksploatacyjne

**Python 3.14 a marker-pdf.** Pillow 10.x (wymagany przez marker-pdf 1.x) nie obsługuje Python 3.14. Rozwiązanie: Python 3.12 zainstalowany równolegle. Launcher `py` zarządza wersjami. Pozostałe trzy skrypty działają na dowolnej wersji Python.

**Marker na CPU Intel bez CUDA.** Intel Core Ultra 5 225U nie ma NVIDIA GPU. Marker działa w trybie CPU — wolno, ale poprawnie. Dla pojedynczych dokumentów akceptowalne. Do batch processing dużych partii — Tesseract lub MarkItDown będą szybsze.

**Tesseract i PATH.** Instalator Windows często nie dodaje Tesseract do PATH automatycznie. Skrypt `ocr.ps1` szuka pod domyślną ścieżką `C:\Program Files\Tesseract-OCR\`. Jeśli instalacja niestandardowa — użyj parametru `-TesseractPath`.

**Kodowanie skryptów.** Skrypty zapisane w UTF-8. Przy kopiowaniu między folderami przez Explorer lub niektóre edytory tekstu może dojść do zmiany kodowania i problemów z parserem PowerShell. W razie błędów parsera — skopiować plik ponownie bezpośrednio z folderu źródłowego lub użyć VS Code do weryfikacji kodowania.



$$ sprawdzone marker bardzo dlugie OCR, duzo CPU ale wyokiej jakosci wynik

MUPDF ani markitdown nie dały rady ze skanami faktur Amazon - dosyc wysokiej jakosci przeciez
MARKITDOWN dobry do konwersji DOCX (xls?, pptx?)


