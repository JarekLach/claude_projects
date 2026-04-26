
$base = "C:\Users\jarek\Downloads\_potx_extracted\content\ppt\slideLayouts"
$out = "C:\Users\jarek\Downloads\_potx_layouts_summary.txt"

$output = @()

for ($i = 1; $i -le 9; $i++) {
    $file = "$base\slideLayout$i.xml"
    if (Test-Path $file) {
        [xml]$xml = Get-Content $file -Raw -Encoding UTF8
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("p", "http://schemas.openxmlformats.org/presentationml/2006/main")
        $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
        
        $root = $xml.DocumentElement
        $layoutName = $root.GetAttribute("type")
        $nameAttr = ""
        
        # Try to get cSld name attribute
        $cSld = $root.SelectSingleNode("p:cSld", $ns)
        if ($cSld) {
            $nameAttr = $cSld.GetAttribute("name")
        }
        
        $output += "===== slideLayout$i.xml ====="
        $output += "  type='$layoutName' cSld.name='$nameAttr'"
        
        # Find all shapes with placeholders
        $shapes = $root.SelectNodes("//p:sp", $ns)
        foreach ($shape in $shapes) {
            $nvSpPr = $shape.SelectSingleNode("p:nvSpPr", $ns)
            if ($nvSpPr) {
                $cNvPr = $nvSpPr.SelectSingleNode("p:cNvPr", $ns)
                $nvPr = $nvSpPr.SelectSingleNode("p:nvPr", $ns)
                $ph = $nvPr.SelectSingleNode("p:ph", $ns) 
                
                $shapeName = if ($cNvPr) { $cNvPr.GetAttribute("name") } else { "?" }
                $shapeId = if ($cNvPr) { $cNvPr.GetAttribute("id") } else { "?" }
                
                if ($ph) {
                    $phType = $ph.GetAttribute("type")
                    $phIdx = $ph.GetAttribute("idx")
                    $phSz = $ph.GetAttribute("sz")
                    
                    # Get position
                    $xfrm = $shape.SelectSingleNode(".//a:xfrm", $ns)
                    $pos = ""
                    if ($xfrm) {
                        $off = $xfrm.SelectSingleNode("a:off", $ns)
                        $ext = $xfrm.SelectSingleNode("a:ext", $ns)
                        if ($off -and $ext) {
                            $pos = "x=$($off.GetAttribute('x')) y=$($off.GetAttribute('y')) cx=$($ext.GetAttribute('cx')) cy=$($ext.GetAttribute('cy'))"
                        }
                    }
                    
                    # Get text properties
                    $txBody = $shape.SelectSingleNode("p:txBody", $ns)
                    $txtInfo = ""
                    if ($txBody) {
                        $bodyPr = $txBody.SelectSingleNode("a:bodyPr", $ns)
                        if ($bodyPr) {
                            $lIns = $bodyPr.GetAttribute("lIns")
                            $anchor = $bodyPr.GetAttribute("anchor")
                            $txtInfo = "lIns=$lIns anchor=$anchor"
                        }
                    }
                    
                    $output += "  [PH] id=$shapeId name='$shapeName' type='$phType' idx='$phIdx' sz='$phSz' $pos | $txtInfo"
                } else {
                    # Non-placeholder shape
                    $xfrm = $shape.SelectSingleNode(".//a:xfrm", $ns)
                    $pos = ""
                    if ($xfrm) {
                        $off = $xfrm.SelectSingleNode("a:off", $ns)
                        $ext = $xfrm.SelectSingleNode("a:ext", $ns)
                        if ($off -and $ext) {
                            $pos = "x=$($off.GetAttribute('x')) y=$($off.GetAttribute('y')) cx=$($ext.GetAttribute('cx')) cy=$($ext.GetAttribute('cy'))"
                        }
                    }
                    
                    # Get any text content
                    $allText = ""
                    $runs = $shape.SelectNodes(".//a:r/a:t", $ns)
                    foreach ($r in $runs) {
                        $allText += $r.InnerText + " "
                    }
                    $allText = $allText.Trim()
                    if ($allText.Length -gt 80) { $allText = $allText.Substring(0, 80) + "..." }
                    
                    $output += "  [SP] id=$shapeId name='$shapeName' $pos | text='$allText'"
                }
            }
        }
        
        # Find images/pictures
        $pics = $root.SelectNodes("//p:pic", $ns)
        foreach ($pic in $pics) {
            $cNvPr = $pic.SelectSingleNode("p:nvPicPr/p:cNvPr", $ns)
            $picName = if ($cNvPr) { $cNvPr.GetAttribute("name") } else { "?" }
            $xfrm = $pic.SelectSingleNode(".//a:xfrm", $ns)
            $pos = ""
            if ($xfrm) {
                $off = $xfrm.SelectSingleNode("a:off", $ns)
                $ext = $xfrm.SelectSingleNode("a:ext", $ns)
                if ($off -and $ext) {
                    $pos = "x=$($off.GetAttribute('x')) y=$($off.GetAttribute('y')) cx=$($ext.GetAttribute('cx')) cy=$($ext.GetAttribute('cy'))"
                }
            }
            $output += "  [PIC] name='$picName' $pos"
        }
        
        # Check for background
        $bg = $root.SelectSingleNode("p:cSld/p:bg", $ns)
        if ($bg) {
            $bgXml = $bg.OuterXml
            if ($bgXml.Length -gt 200) { $bgXml = $bgXml.Substring(0, 200) + "..." }
            $output += "  [BG] $bgXml"
        }
        
        $output += ""
    }
}

$output -join "`n" | Out-File $out -Encoding UTF8
Write-Host "Done."
