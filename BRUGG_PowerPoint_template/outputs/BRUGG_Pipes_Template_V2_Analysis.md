# BRUGG Pipes Template V2 — Pełna analiza szablonu

> **Plik źródłowy:** `BRUGG_Pipes_Template_V2.potx`  
> **Utworzony przez:** Vorlagenbauer.ch  
> **Język interfejsu szablonu:** de-CH (niemiecki, Szwajcaria)

---

## 1. Wymiary slajdu

| Parametr | Wartość EMU | Wartość cm | Wartość cale |
|----------|-------------|------------|--------------|
| Szerokość (`cx`) | 12 192 000 | 33.87 cm | 13.33" |
| Wysokość (`cy`) | 6 858 000 | 19.05 cm | 7.5" |
| **Format** | **16:9 Widescreen** | — | — |

---

## 2. Paleta kolorów Theme (Color Scheme: "Brugg Group")

| Rola | Nazwa XML | Kolor HEX | Opis |
|------|-----------|-----------|------|
| **Dark 1 (dk1)** | `windowText` | `#000000` | Czarny — tekst główny |
| **Light 1 (lt1)** | `window` | `#FFFFFF` | Biały — tło główne |
| **Dark 2 (dk2)** | `srgbClr` | `#797979` | Szary średni |
| **Light 2 (lt2)** | `srgbClr` | `#D8D8D8` | Szary jasny |
| **Accent 1** | `srgbClr` | `#283583` | **BRUGG Niebieski** (ciemny granat) |
| **Accent 2** | `srgbClr` | `#939BBF` | Bławatek/jasny granat |
| **Accent 3** | `srgbClr` | `#C9CDDF` | Lawendowo-szary |
| **Accent 4** | `srgbClr` | `#E63D37` | **Czerwony BRUGG** |
| **Accent 5** | `srgbClr` | `#00ADA5` | Turkusowy/teal |
| **Accent 6** | `srgbClr` | `#0079BF` | Niebieski jasny |
| **Hyperlink** | `srgbClr` | `#000000` | Czarny |
| **Followed Hyperlink** | `srgbClr` | `#000000` | Czarny |

**Kolor logo BRUGG w vektorach:** `#2A3E91` (granat — nieco jaśniejszy niż Accent 1)  
**Kolor "Pipes" w logo:** `#000000` (czarny)

---

## 3. Czcionki (Font Scheme: "Arial")

| Zastosowanie | Czcionka | Typeface |
|-------------|----------|----------|
| **Major Font (tytuły)** | Arial | `panose="020B0604020202020204"` |
| **Minor Font (treść)** | Arial | `panose="020B0604020202020204"` |

> Szablon używa **wyłącznie czcionki Arial** zarówno dla tytułów jak i treści. Brak pary fontów — jednolity krój.

### Rozmiary i style tekstowe

| Element | Rozmiar | Bold | Caps | Spacing | Kolor |
|---------|---------|------|------|---------|-------|
| **Tytuł slajdu (Slide Master)** | 21pt (2100) | ✅ Tak | ALL CAPS | +70 (letter-spacing) | dk1 (czarny) |
| **Tytuł — slajd tytułowy** | 48pt (4800) | ❌ Nie | none | 0 | dk1 / bg1 zależnie od layoutu |
| **Podtytuł — slajd tytułowy** | 24pt (2400) | ❌ Nie | none | +50 | dk1 / bg1 |
| **Untertitel (subtitle placeholder)** | 16pt (1600) | ✅ Tak | ALL CAPS | +50 | accent1 `#283583` |
| **Body text lvl1** | 15pt (1500) | ❌ Nie | none | 0 | dk1 |
| **Body text lvl2–5** | 15pt (1500) | ❌ Nie | none | 0 | dk1 |
| **Footer text** | 8pt (800) | ❌ Nie | none | +30 | dk1 |
| **Date text** | 8pt (800) | ❌ Nie | none | +30 | dk1 |
| **Slide number** | 8pt (800) | ❌ Nie | none | +30 | dk1 |
| **bruggpipes.com (master)** | 8pt (800) | ❌ Nie | none | +20 | accent1 `#283583` |
| **bruggpipes.com (title slide)** | 15pt (1500) | ❌ Nie | none | 0 | accent1 `#283583` |
| **Erstellt durch...** | 6pt (600) | ❌ Nie | none | +40 | bg1 75% lumMod (szary) |
| **"Folie" (obok nr)** | 8pt (800) | ❌ Nie | none | +30 | dk1 |

---

## 4. Slide Master — główny (slideMaster1)

### Tło
Białe — `bgRef idx="1001"` → `schemeClr bg1` = `#FFFFFF`

### Placeholdery w Masterze

| # | Nazwa | Typ | Pozycja (EMU) | Rozmiar (EMU) | Uwagi |
|---|-------|-----|---------------|---------------|-------|
| 1 | Titelplatzhalter 1 | `title` | x=767589 y=884838 | 11106910 × 343236 | Insets: 0/0/0/0, anchor: top |
| 2 | Textplatzhalter 2 | `body` idx=1 | x=767588 y=1973179 | 11106911 × 4203784 | Insets: 0/0/0/0 |
| 3 | Datumsplatzhalter 3 | `dt` idx=2 | x=8619361 y=430794 | 587561 × 121277 | Insets: 0/0/0/0, left-aligned |
| 4 | Fußzeilenplatzhalter 4 | `ftr` idx=3 | x=1167220 y=431462 | 7310635 × 121277 | right-aligned |
| 5 | Foliennummernplatzhalter 5 | `sldNum` idx=4 | x=10519293 y=430794 | 276000 × 121277 | left-aligned |

### Stałe elementy graficzne (userDrawn)

| Element | Pozycja | Opis |
|---------|---------|------|
| Logo **BRUGG** (grupa wektorowa) | x=10808494 y=316558 (1063648 × 465010) | Litery B-R-U-G-G + "Pipes" — 10 kształtów Freeform w `#2A3E91` i `#000000` |
| **bruggpipes.com** | x=9301524 y=428960 (925009 × 123111) | Tekst w accent1 |
| **"Folie"** (przed nr slajdu) | x=10256772 y=429878 (276000 × 123111) | Tekst 8pt |
| **Erstellt durch Vorlagenbauer.ch** | obrócony 270° (rot=16200000), dolny-prawy | 6pt, szary 75% |

### Prowadnice (Guides)

| ID | Orientacja | Pozycja (1/8 pt) | Pozycja (cm) | Kolor |
|----|------------|-------------------|--------------|-------|
| 1 | Pionowa | 481 | ~2.12 cm | `#F26B43` |
| 2 | Pionowa | 7480 | ~32.97 cm | `#F26B43` |
| 3 | Pozioma | 1239 | ~5.46 cm | `#F26B43` |
| 4 | Pozioma | 3896 | ~17.17 cm | `#F26B43` |

---

## 5. Bullet Styles (Body Style z Mastera)

| Poziom | Indent marL | Indent hanging | Bullet | Czcionka bullet | Rozmiar | Line Spacing |
|--------|-------------|----------------|--------|-----------------|---------|--------------|
| **Lvl1** | 0 | 0 | Brak (buNone) | — | 15pt | 125% |
| **Lvl2** | 162000 (≈0.45cm) | -162000 | Wingdings `§` | Wingdings | 75% rozmiaru | 125%, spcBef=600pt |
| **Lvl3** | 324000 (≈0.90cm) | -162000 | Wingdings `§` | Wingdings | 75% rozmiaru | 125%, spcBef=600pt |
| **Lvl4** | 486000 (≈1.35cm) | -162000 | Wingdings `§` | Wingdings | 75% rozmiaru | 125%, spcBef=600pt |
| **Lvl5** | 648000 (≈1.80cm) | -162000 | Wingdings `§` | Wingdings | 75% rozmiaru | 125%, spcBef=600pt |

> **Uwaga:** Wingdings `§` renderuje się jako mały kwadratowy bullet (■). Lvl1 nie ma bulletu — czysty tekst.

---

## 6. Text Body Defaults (Object Defaults z Theme)

| Obiekt | Insets (L/T/R/B) | AutoFit | Anchor | Fill |
|--------|-------------------|---------|--------|------|
| **Shape default** | 91440/45720/91440/45720 | — | center | accent1 fill, no line |
| **Text box default** | 0/0/0/0 | spAutoFit | — | noFill |
| **Line default** | — | — | — | accent1 stroke, 12700 width |

---

## 7. Efekty (Format Scheme: "Office")

| Styl | Opis |
|------|------|
| **Line Style 1** | 6350 EMU (0.5pt), solid, miter |
| **Line Style 2** | 12700 EMU (1pt), solid, miter |
| **Line Style 3** | 19050 EMU (1.5pt), solid, miter |
| **Effect Style 1** | Brak efektów |
| **Effect Style 2** | Brak efektów |
| **Effect Style 3** | Outer Shadow: blur=57150, dist=19050, dir=5400000 (dół), alpha=63% |

---

## 8. Wszystkie Slide Layouts (9 layoutów)

### Layout 1: "Titelfolie" (Slajd tytułowy)
**Typ:** `title` | **showMasterSp:** `0` (master ukryty)

| Placeholder | Typ | Pozycja | Rozmiar | Formatowanie |
|-------------|-----|---------|---------|--------------|
| Titel 1 | `ctrTitle` | x=763588 y=2117558 | 11110912 × 1239254 | 48pt, no-bold, no-caps, spc=0, anchor=bottom, left-aligned |
| Untertitel 2 | `subTitle` idx=1 | x=763588 y=3758962 | 11110912 × 776038 | 24pt, spc=50, left-aligned |

**Elementy stałe:** Logo BRUGG (duże, 2181676 × 953794 w prawym-górnym), bruggpipes.com (15pt), credit Vorlagenbauer.ch

---

### Layout 2: "Titelfolie mit Bild" (Tytuł z obrazem tła)
**Typ:** custom | **showMasterSp:** `0` (master ukryty)

| Placeholder | Typ | Pozycja | Rozmiar | Formatowanie |
|-------------|-----|---------|---------|--------------|
| Bildplatzhalter 4 | `pic` idx=13 | x=0 y=0 | 12192000 × 7040135 | Pełnoekranowy obraz tła |
| Titel 1 | `ctrTitle` | x=763588 y=2105526 | 11110912 × 1239254 | 48pt, biały tekst (bg1) |
| Untertitel 2 | `subTitle` idx=1 | x=763588 y=3746930 | 11110912 × 776038 | 24pt, biały tekst (bg1), spc=50 |
| Logo placeholder | `body` idx=14 | x=9436895 y=619675 | 2187366 × 968620 | Wypełniony obrazem logo (blip) |
| Logo white | `body` idx=15 | x=645319 y=535781 | 1595437 × 404813 | Białe logo (blip fill) |

---

### Layout 3: "Titel und Inhalt" (Tytuł i treść — główny layout roboczy)
**Typ:** custom | **showMasterSp:** domyślnie (master widoczny)

| Placeholder | Typ | Pozycja | Rozmiar | Formatowanie |
|-------------|-----|---------|---------|--------------|
| Titel 3 | `title` | z Mastera | z Mastera | 21pt, bold, ALL CAPS, spc=70 |
| Textplatzhalter 9 | `body` idx=13 | x=757739 y=1436714 | 9018163 × 257696 | **Subtitle:** 16pt, bold, ALL CAPS, spc=50, accent1 |
| Inhaltsplatzhalter 2 | content idx=1 | x=767588 y=1966913 | 11106912 × 4210050 | Body z bulletami (15pt) |
| Datumsplatzhalter | `dt` idx=14 | z Mastera | z Mastera | 8pt |
| Fußzeilenplatzhalter | `ftr` idx=15 | z Mastera | z Mastera | 8pt |
| Foliennummernplatzhalter | `sldNum` idx=16 | z Mastera | z Mastera | 8pt |

---

### Layout 4: "Zwei Inhalte" (Dwie kolumny)
**Typ:** custom | **showMasterSp:** domyślnie (master widoczny)

| Placeholder | Typ | Pozycja | Rozmiar | Formatowanie |
|-------------|-----|---------|---------|--------------|
| Titel 1 | `title` | z Mastera | z Mastera | jak master |
| Subtitle | `body` idx=13 | x=757739 y=1436714 | 9018163 × 257696 | 16pt bold ALL CAPS accent1 |
| Lewa kolumna | content idx=1 (half) | x=768995 y=1966913 | 5359373 × 4210050 | Body + bullets |
| Prawa kolumna | content idx=2 (half) | x=6508575 y=1966913 | 5359373 × 4210050 | Body + bullets |
| dt/ftr/sldNum | idx=10/11/12 | z Mastera | z Mastera | — |

---

### Layout 5: "Vier Bilder mit Beschriftung" (4 obrazy z podpisami)
**Typ:** custom

| Placeholder | Typ | Pozycja | Rozmiar |
|-------------|-----|---------|---------|
| Titel | `title` | z Mastera | z Mastera |
| 4× Label headers | `body` idx=21–24 | 4 kolumny × | 1626444 × 754213 każdy |
| 4× Pic placeholders | `pic` idx=14–17 | 4 kolumny × | 1626444 × 2115802 każdy |
| 4× Content text | content idx=1,18–20 (half) | 4 kolumny × | 1626444 × 1528449 każdy |

**Label headers:** 16pt bold ALL CAPS accent1 (lvl1), 10pt accent2 (lvl2)  
**Content text:** 16pt, line-spacing 114%

---

### Layout 6: "Inhalt und fünf Bilder" (Treść + 5 obrazów)
**Typ:** custom

| Placeholder | Typ | Pozycja | Rozmiar |
|-------------|-----|---------|---------|
| Titel | `title` | z Mastera | z Mastera |
| Subtitle | `body` idx=13 | x=757739 y=1436714 | 9018163 × 257696 |
| Content (left) | content idx=1 (half) | x=777262 y=2141621 | 2942474 × 4043279 |
| 5× Image | `pic` idx=16–21 | Grid: 2×2 + 1 vertical | Różne rozmiary (ok. 2322000 × 1915200) |

---

### Layout 7: "Titel und Bild" (Tytuł + jedno duże zdjęcie)
**Typ:** custom

| Placeholder | Typ | Pozycja | Rozmiar |
|-------------|-----|---------|---------|
| Titel | `title` | z Mastera | z Mastera |
| Subtitle | `body` idx=14 | x=757739 y=1436714 | 9018163 × 257696 |
| Big Image | `pic` idx=13 | x=763588 y=1966912 | 11110911 × 4217987 |
| dt/ftr/sldNum | idx=10/11/12 | z Mastera | z Mastera |

---

### Layout 8: "Nur Titel" (Tylko tytuł)
**Typ:** custom

| Placeholder | Typ | Pozycja | Rozmiar |
|-------------|-----|---------|---------|
| Titel | `title` | z Mastera | z Mastera |
| Subtitle | `body` idx=13 | x=757739 y=1436714 | 9018163 × 257696 |
| dt/ftr/sldNum | idx=10/11/12 | z Mastera | z Mastera |

---

### Layout 9: "Leer" (Pusty)
**Typ:** `blank`

| Placeholder | Typ | Pozycja | Rozmiar |
|-------------|-----|---------|---------|
| dt/ftr/sldNum | idx=10/11/12 | z Mastera | z Mastera |

Brak tytułu, brak treści — tylko header bar z logo z Mastera.

---

## 9. Footer / Header bar (pasek nagłówkowy)

Pasek nagłówkowy jest zdefiniowany na **Slide Master** i pojawia się na wszystkich layoutach z `showMasterSp` ≠ 0 (czyli layouty 3–9).

**Układ od lewej do prawej (y ≈ 430000 EMU = ok. 1.2cm od góry):**

```
[Footer text (right-align)]  [Date]  [bruggpipes.com (accent1)]  [„Folie"]  [Nr slajdu]  [Logo BRUGG]
 x≈1167220                    x≈8619    x≈9301                    x≈10257    x≈10519      x≈10808
```

Footer: `hf hdr="0"` — nagłówek ukryty w opcjach prezentacji, widoczny jest footer.

---

## 10. Podsumowanie reguł formatowania

1. **Tytuł slajdu:** Arial 21pt, BOLD, ALL CAPS, letter-spacing +70, czarny, wyrównanie do lewej, anchor top, zero insets
2. **Subtitle (pod tytułem):** Arial 16pt, BOLD, ALL CAPS, letter-spacing +50, accent1 (granat), osobny placeholder
3. **Body text:** Arial 15pt, normal, line-spacing 125%, wyrównanie do lewej, zero insets
4. **Bullety (lvl2+):** Wingdings §, 75% rozmiaru tekstu, indent 162000 EMU, spcBef 600pt
5. **Slajd tytułowy:** 48pt normal (nie bold!), bezszeryfowy, anchor=bottom — tekst "opada" do dołu
6. **Kolory firmowe:** granat `#283583` (accent1), czerwony `#E63D37` (accent4), turkus `#00ADA5` (accent5)
7. **Logo:** Wektorowe kształty (nie obraz) w `#2A3E91`, w prawym górnym rogu na masterze
8. **Marginesy treści:** lewy ~2.1cm (767588 EMU), od góry ~2.7cm (title y=884838), prawy = lewy
9. **Obrazy w placeholderach:** wzór szachownicowy (lgCheck) jako wskaźnik pustego pola

---

## 11. YAML/JSON Configuration Summary

```yaml
brugg_pipes_template_v2:
  metadata:
    name: "BRUGG_Pipes_Template V2"
    family_id: "{BADAECF5-2E97-48B6-9FDE-A5350B75E2A7}"
    created_by: "Vorlagenbauer.ch"
    language: "de-CH"
  
  slide:
    width_emu: 12192000
    height_emu: 6858000
    width_inches: 13.333
    height_inches: 7.5
    aspect_ratio: "16:9"
  
  theme:
    name: "Benutzerdefiniertes Design"
    color_scheme:
      name: "Brugg Group"
      dk1: "#000000"     # windowText - black
      lt1: "#FFFFFF"     # window - white
      dk2: "#797979"     # medium gray
      lt2: "#D8D8D8"     # light gray
      accent1: "#283583" # BRUGG navy blue
      accent2: "#939BBF" # light navy/lavender
      accent3: "#C9CDDF" # lavender-gray
      accent4: "#E63D37" # BRUGG red
      accent5: "#00ADA5" # teal/turquoise
      accent6: "#0079BF" # blue
      hlink: "#000000"
      folHlink: "#000000"
    
    logo_vector_color: "#2A3E91"
    logo_text_color: "#000000"    # "Pipes" text
    
    font_scheme:
      name: "Arial"
      major_latin: "Arial"
      minor_latin: "Arial"
    
    format_scheme: "Office"
    effect_styles:
      - none
      - none
      - outer_shadow: { blur: 57150, dist: 19050, dir: "5400000", alpha: "63%" }
    line_styles:
      - { width: 6350, cap: "flat", dash: "solid" }
      - { width: 12700, cap: "flat", dash: "solid" }
      - { width: 19050, cap: "flat", dash: "solid" }
  
  text_styles:
    title:
      font: "Arial"
      size_pt: 21
      bold: true
      caps: "all"
      letter_spacing: 70   # hundredths of a point
      color: "dk1"
      alignment: "left"
      line_spacing: "100%"
      body_insets_emu: [0, 0, 0, 0]
      anchor: "top"
    
    subtitle_placeholder:
      font: "Arial"
      size_pt: 16
      bold: true
      caps: "all"
      letter_spacing: 50
      color: "accent1"
      alignment: "left"
    
    body_lvl1:
      font: "Arial"
      size_pt: 15
      bold: false
      caps: "none"
      letter_spacing: 0
      color: "dk1"
      alignment: "left"
      line_spacing: "125%"
      space_before_pt: 0
      bullet: "none"
      body_insets_emu: [0, 0, 0, 0]
    
    body_lvl2_to_5:
      font: "Arial"
      size_pt: 15
      bold: false
      color: "dk1"
      line_spacing: "125%"
      space_before_pt: 6
      bullet:
        font: "Wingdings"
        char: "§"
        size_pct: 75
      indent_emu: 162000   # per level step
      hanging_emu: 162000
    
    title_slide_title:
      font: "Arial"
      size_pt: 48
      bold: false
      caps: "none"
      letter_spacing: 0
      alignment: "left"
      anchor: "bottom"
    
    title_slide_subtitle:
      font: "Arial"
      size_pt: 24
      bold: false
      letter_spacing: 50
      alignment: "left"
    
    footer:
      font: "Arial"
      size_pt: 8
      letter_spacing: 30
      color: "dk1"
      alignment_ftr: "right"
      alignment_dt: "left"
      alignment_sldNum: "left"
  
  slide_master:
    background: "lt1"  # white
    header_bar_y_emu: 430000
    content_margins:
      left_emu: 767588
      top_title_emu: 884838
      top_body_emu: 1973179
      right_emu: 767588  # (12192000 - 767588 - 11106911 ≈ 317501 -> ~768000)
    branding:
      logo_position: "top-right"
      logo_x_emu: 10808494
      logo_y_emu: 316558
      logo_width_emu: 1063648
      logo_height_emu: 465010
      website_text: "bruggpipes.com"
      website_color: "accent1"
      credit_text: "Erstellt durch Vorlagenbauer.ch"
      credit_rotation_deg: 270
      credit_size_pt: 6
    guides:
      - { orient: "v", pos_eighths_pt: 481 }
      - { orient: "v", pos_eighths_pt: 7480 }
      - { orient: "h", pos_eighths_pt: 1239 }
      - { orient: "h", pos_eighths_pt: 3896 }
  
  layouts:
    - index: 1
      name: "Titelfolie"
      type: "title"
      show_master: false
      placeholders:
        - type: "ctrTitle"
          position: { x: 763588, y: 2117558, cx: 11110912, cy: 1239254 }
          style: { size_pt: 48, bold: false, caps: "none", anchor: "bottom" }
        - type: "subTitle"
          idx: 1
          position: { x: 763588, y: 3758962, cx: 11110912, cy: 776038 }
          style: { size_pt: 24, spacing: 50 }
      branding: "BRUGG logo large (vector group) + bruggpipes.com 15pt"
    
    - index: 2
      name: "Titelfolie mit Bild"
      type: "custom"
      show_master: false
      placeholders:
        - type: "pic"
          idx: 13
          position: { x: 0, y: 0, cx: 12192000, cy: 7040135 }
          note: "Full-bleed background image"
        - type: "ctrTitle"
          position: { x: 763588, y: 2105526, cx: 11110912, cy: 1239254 }
          style: { size_pt: 48, color: "bg1", anchor: "bottom" }
        - type: "subTitle"
          idx: 1
          position: { x: 763588, y: 3746930, cx: 11110912, cy: 776038 }
          style: { size_pt: 24, color: "bg1", spacing: 50 }
        - type: "body"
          idx: 14
          note: "Logo placeholder (blip fill, top-right)"
        - type: "body"
          idx: 15
          note: "White logo placeholder (blip fill, top-left)"
    
    - index: 3
      name: "Titel und Inhalt"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
          note: "Inherited from master"
        - type: "body"
          idx: 13
          position: { x: 757739, y: 1436714, cx: 9018163, cy: 257696 }
          note: "Subtitle line — 16pt bold ALL CAPS accent1"
        - type: "content"
          idx: 1
          position: { x: 767588, y: 1966913, cx: 11106912, cy: 4210050 }
          note: "Main body with bullet levels"
        - type: "dt"
          idx: 14
        - type: "ftr"
          idx: 15
        - type: "sldNum"
          idx: 16
    
    - index: 4
      name: "Zwei Inhalte"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
        - type: "body"
          idx: 13
          note: "Subtitle line — 16pt bold ALL CAPS accent1"
        - type: "content"
          idx: 1
          position: { x: 768995, y: 1966913, cx: 5359373, cy: 4210050 }
          note: "Left column"
        - type: "content"
          idx: 2
          position: { x: 6508575, y: 1966913, cx: 5359373, cy: 4210050 }
          note: "Right column"
    
    - index: 5
      name: "Vier Bilder mit Beschriftung"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
        - note: "4x body headers (idx 21-24) + 4x pic (idx 14-17) + 4x text (idx 1,18-20)"
    
    - index: 6
      name: "Inhalt und fünf Bilder"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
        - type: "body"
          idx: 13
          note: "Subtitle line"
        - type: "content"
          idx: 1
          position: { x: 777262, y: 2141621, cx: 2942474, cy: 4043279 }
          note: "Left text column"
        - note: "5x pic placeholders (idx 16-21) in 2x2 grid + 1 vertical right"
    
    - index: 7
      name: "Titel und Bild"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
        - type: "body"
          idx: 14
          note: "Subtitle line"
        - type: "pic"
          idx: 13
          position: { x: 763588, y: 1966912, cx: 11110911, cy: 4217987 }
          note: "Full-width image below title"
    
    - index: 8
      name: "Nur Titel"
      type: "custom"
      show_master: true
      placeholders:
        - type: "title"
        - type: "body"
          idx: 13
          note: "Subtitle line only — no body content"
    
    - index: 9
      name: "Leer"
      type: "blank"
      show_master: true
      placeholders: []
      note: "Only dt/ftr/sldNum from master. No title, no content."

  media_files:
    - image1.emf
    - image2.emf
    - image3.jpeg
    - image4.png
    - image5.jpeg
    - image6.jpeg
    - image7.jpeg
    - image8.jpeg
    - image9.jpeg
    - image10.jpeg
    - image11.jpeg
    - image12.jpeg
  
  embedded_charts: 4     # chart1-4.xml with Excel data
  embedded_diagrams: 1   # SmartArt diagram
  sample_slides: 9       # pre-filled example slides
```
