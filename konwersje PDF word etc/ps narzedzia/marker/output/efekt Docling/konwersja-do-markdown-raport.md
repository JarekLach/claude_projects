# Konwersja dokumentów do Markdown dla pracy z Claude

*Raport: kwiecień 2026*

## Kontekst

Celem jest przekształcenie plików PDF, DOCX, XLSX i PPTX do formatu Markdown tak, żeby pracować z nimi w Claude szybko i ekonomicznie — minimalizując liczbę tokenów przy zachowaniu struktury dokumentu (nagłówki, tabele, listy, odniesienia do danych).

## Opcja 1 — PyMuPDF4LLM (Artifex)

**Niezależny dostawca · open-source · rekomendowana do PDF**

PyMuPDF4LLM to rozszerzenie do biblioteki PyMuPDF, stworzone przez Artifex — firmę niezależną od wielkich platform. Specjalizuje się w ekstrakcji PDF do czystego Markdown zoptymalizowanego pod kątem LLM i pipeline'ów RAG.

**Mocne strony:**

- Najlepsza ekonomiczność tokenów z wszystkich narzędzi — generuje zwarty, strukturalny Markdown bez redundancji i "szumu"
- 10–250× tańsze niż podejścia wizyjne (np. Claude Vision na każdej stronie)
- Działa w pełni lokalnie, bez GPU, bardzo szybko
- Zachowuje układ strony, kolumny, tabele w PDF-ach z selectable text
- Dostępny jako serwer MCP ( `pymupdf4llm-mcp` ) — działa bezpośrednio z Claude

**Ograniczenia:**

- Zoptymalizowany głównie pod PDF; DOCX/PPTX/XLSX nie są jego podstawowym zastosowaniem
- Dla skanowanych PDF bez warstwy tekstowej potrzebny OCR

**Instalacja:**

```
pip install pymupdf4llm
pip install pymupdf4llm-mcp   # wersja MCP dla Claude
```

**Cena:** bezpłatny, open-source (licencja AGPL/komercyjna)

**Kiedy używać:** PDF z tekstem selectable — oferty, raporty, specyfikacje techniczne, dokumenty przetargowe.

## Opcja 2 — MarkItDown (Microsoft)

**Najpopularniejsza opcja wśród użytkowników Claude · open-source**

MarkItDown to biblioteka Pythona rozwijana przez Microsoft, zaprojektowana wprost do przygotowania dokumentów dla LLM. Jest najczęściej wymieniana w społeczności Claude i ma oficjalny serwer MCP, który można podłączyć bezpośrednio do Claude Desktop lub Claude Code (Cowork).

**Obsługiwane formaty:** PDF, DOCX, PPTX, XLSX/XLS, HTML, obrazy (JPG, PNG), audio (WAV, MP3), ZIP

**Mocne strony:**

- Jedno narzędzie obsługuje wszystkie formaty — PDF, Office, HTML
- Natywna integracja z Claude przez MCP: narzędzie `convert_to_markdown(uri)` dostępne bez żadnego dodatkowego kroku
- Zachowuje strukturę dla plików Office (nagłówki, listy, tabele w DOCX i PPTX)
- Działa lokalnie, bez kosztów API

**Ograniczenia:**

- Dla PDF ekstrakcja jest podstawowa — tylko tekst, bez hierarchii nagłówków; złożone tabele wychodzą jako plain text
- Dla skanowanych PDF (bez OCR) wynik jest słaby

**Instalacja i konfiguracja MCP:**

```
pip install "markitdown[all]"
pip install markitdown-mcp
```

W `claude_desktop_config.json` :

```
{
  "mcpServers": {
    "markitdown": {
      "command": "markitdown-mcp"
    }
  }
}
```

**Cena:** bezpłatny, open-source (MIT)

**Kiedy używać:** codzienna praca z plikami Office (DOCX raporty, PPTX prezentacje, XLSX dane), gdy wygoda integracji z Claude jest priorytetem.

## Opcja 3 — Docling (IBM Research)

**Najwyższa jakość · rekomendowana dla złożonych dokumentów**

Docling pochodzi z IBM Research i jest zaprojektowany do produkcyjnych pipeline'ów ekstrakcji danych. Zamiast prostego tekstu generuje strukturalny obiekt `DoclingDocument` — zachowuje semantyczną hierarchię dokumentu, nie tylko jego zawartość.

**Obsługiwane formaty:** PDF, DOCX, PPTX, XLSX, HTML, obrazy, LaTeX, plain text

**Mocne strony:**

- Najlepsza jakość tabel — konwertuje złożone tabele do poprawnego Markdown bez utraty struktury
- Zachowuje hierarchię semantyczną (sekcje, podsekcje, elementy list) niezależnie od formatu źródłowego
- Integracje z LlamaIndex i LangChain; możliwa ekspansja do bardziej zaawansowanych pipeline'ów RAG
- Obsługuje dokumenty wielojęzyczne i złożone układy strony

**Ograniczenia:**

- Wolniejszy niż PyMuPDF4LLM — pobiera i uruchamia modele AI z Hugging Face przy pierwszym użyciu
- Wymaga więcej zasobów (RAM, storage) i czasu na inicjalizację
- Większa złożoność instalacji w porównaniu do MarkItDown

**Instalacja:**

```
pip install docling
```

**Cena:** bezpłatny, open-source (MIT); modele pobierane z Hugging Face (lokalnie)

**Kiedy używać:** złożone raporty techniczne, specyfikacje z wielopoziomowymi tabelami, dokumentacja z precyzyjną strukturą, która musi być wiernie odwzorowana w Markdown.

## Podsumowanie porównawcze

| Kryterium             | PyMuPDF4LLM              | MarkItDown        | Docling             |
|-----------------------|--------------------------|-------------------|---------------------|
| Formaty               | PDF (głównie)            | PDF + cały Office | PDF + cały Office   |
| Jakość PDF            | dobra (tekst selectable) | podstawowa        | najlepsza           |
| Jakość Office         | ograniczona              | dobra             | najlepsza           |
| Ekonomiczność tokenów | najlepsza                | dobra             | dobra               |
| Szybkość              | najszybszy               | szybki            | wolniejszy          |
| Integracja z Claude   | MCP dostępne             | MCP natywne       | brak MCP (na razie) |
| Wymagania             | minimalne                | minimalne         | modele AI lokalnie  |
| Cena                  | bezpłatny                | bezpłatny         | bezpłatny           |

## Rekomendacja praktyczna

Dla codziennej pracy (BRUGG, raporty, oferty, specyfikacje) optymalne jest połączenie dwóch narzędzi:

- **MarkItDown** jako MCP w Claude Desktop / Cowork — obsługuje wszystkie formaty jednym poleceniem, wystarczający dla większości plików Office
- **PyMuPDF4LLM** jako uzupełnienie dla PDF-ów, gdzie zależy na ekonomiczności tokenów i czystości struktury

Docling warto mieć jako opcję dla wyjątkowo złożonych dokumentów (np. wielostronicowe specyfikacje techniczne z tabelami danych).

## Wzmianka: Mistral Document AI (płatne API)

Dla skanowanych PDF lub dokumentów o bardzo złożonym układzie graficznym, gdzie żadne z powyższych narzędzi nie daje wystarczającej jakości, istnieje płatne API Mistral Document AI — oceniane jako najdokładniejsze dla trudnych przypadków, ale generuje koszty per strona.

*Źródła: GitHub microsoft/markitdown, Artifex pymupdf4llm, IBM Docling, Systenics AI Blog, themenonlab.blog, realpython.com*