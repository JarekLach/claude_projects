##### MarkItDown — wszystkie obsługiwane formaty w bieżącym folderze

.\mid.ps1

##### MarkItDown — jeden plik

.\mid.ps1 -File oferta.docx

##### PyMuPDF4LLM — wszystkie PDF w bieżącym folderze

.\mupdf.ps1

##### PyMuPDF4LLM — jeden plik, tylko strony 0-2

.\mupdf.ps1 -File raport.pdf -Pages "0,1,2"

##### Oba — nadpisz istniejące .md

.\mid.ps1 -Overwrite
.\mupdf.ps1 -Overwrite
