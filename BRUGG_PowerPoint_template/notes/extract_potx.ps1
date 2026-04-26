
# Extract POTX template info
$potxPath = "C:\Users\jarek\Downloads\BRUGG_Pipes_Template V2.potx"
$extractDir = "C:\Users\jarek\Downloads\_potx_extracted"
$outputFile = "C:\Users\jarek\Downloads\_potx_analysis.txt"

# Clean up previous extraction
if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

# Copy and rename to .zip
$zipPath = "$extractDir\template.zip"
Copy-Item $potxPath $zipPath

# Extract
Expand-Archive -Path $zipPath -DestinationPath "$extractDir\content" -Force

# Collect all XML files content
$output = @()
$xmlFiles = Get-ChildItem -Path "$extractDir\content" -Recurse -Filter "*.xml" | Sort-Object FullName

foreach ($file in $xmlFiles) {
    $relativePath = $file.FullName.Replace("$extractDir\content\", "")
    $output += "===== FILE: $relativePath ====="
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $output += $content
    $output += ""
}

# Also list all files
$output += "===== ALL FILES ====="
Get-ChildItem -Path "$extractDir\content" -Recurse | ForEach-Object {
    $rel = $_.FullName.Replace("$extractDir\content\", "")
    $size = if ($_.PSIsContainer) { "[DIR]" } else { "$($_.Length) bytes" }
    $output += "$rel  ($size)"
}

$output -join "`n" | Out-File $outputFile -Encoding UTF8
Write-Host "Done. Output written to $outputFile"
