
$base = "C:\Users\jarek\Downloads\_potx_extracted\content\ppt\slideLayouts"
$out = "C:\Users\jarek\Downloads\_potx_layouts_quick.txt"
$output = @()

for ($i = 4; $i -le 9; $i++) {
    $file = "$base\slideLayout$i.xml"
    if (Test-Path $file) {
        [xml]$xml = Get-Content $file -Raw -Encoding UTF8
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("p", "http://schemas.openxmlformats.org/presentationml/2006/main")
        $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
        
        $root = $xml.DocumentElement
        $cSld = $root.SelectSingleNode("p:cSld", $ns)
        $nameAttr = if ($cSld) { $cSld.GetAttribute("name") } else { "" }
        $showMaster = $root.GetAttribute("showMasterSp")
        
        $output += "===== Layout $i: '$nameAttr' (showMaster=$showMaster) ====="
        
        $shapes = $root.SelectNodes("//p:sp/p:nvSpPr/p:nvPr/p:ph", $ns)
        foreach ($ph in $shapes) {
            $phType = $ph.GetAttribute("type")
            $phIdx = $ph.GetAttribute("idx")
            $phSz = $ph.GetAttribute("sz")
            $hasPrompt = $ph.GetAttribute("hasCustomPrompt")
            $sp = $ph.ParentNode.ParentNode.ParentNode
            $nameNode = $sp.SelectSingleNode("p:nvSpPr/p:cNvPr", $ns)
            $shapeName = if ($nameNode) { $nameNode.GetAttribute("name") } else { "" }
            
            $xfrm = $sp.SelectSingleNode(".//a:xfrm", $ns)
            $pos = ""
            if ($xfrm) {
                $off = $xfrm.SelectSingleNode("a:off", $ns)
                $ext = $xfrm.SelectSingleNode("a:ext", $ns)
                if ($off -and $ext) {
                    $pos = "x=$($off.GetAttribute('x')) y=$($off.GetAttribute('y')) cx=$($ext.GetAttribute('cx')) cy=$($ext.GetAttribute('cy'))"
                }
            }
            
            # Get text style info
            $defRPr = $sp.SelectSingleNode(".//a:lstStyle/a:lvl1pPr/a:defRPr", $ns)
            $style = ""
            if ($defRPr) {
                $sz = $defRPr.GetAttribute("sz")
                $b = $defRPr.GetAttribute("b")
                $cap = $defRPr.GetAttribute("cap")
                $spc = $defRPr.GetAttribute("spc")
                $style = "sz=$sz b=$b cap=$cap spc=$spc"
            }
            
            $output += "  [PH] name='$shapeName' type='$phType' idx='$phIdx' sz='$phSz' prompt=$hasPrompt | $pos | $style"
        }
        
        # Find background
        $bg = $root.SelectSingleNode("p:cSld/p:bg", $ns)
        if ($bg) {
            $srgb = $bg.SelectSingleNode(".//a:srgbClr", $ns)
            $scheme = $bg.SelectSingleNode(".//a:schemeClr", $ns)
            if ($srgb) { $output += "  [BG] srgbClr=$($srgb.GetAttribute('val'))" }
            if ($scheme) { $output += "  [BG] schemeClr=$($scheme.GetAttribute('val'))" }
        }
        
        # Find images/pics
        $pics = $root.SelectNodes("//p:pic", $ns)
        if ($pics.Count -gt 0) { $output += "  [PICS] $($pics.Count) image(s)" }
        
        $output += ""
    }
}

$output -join "`n" | Out-File $out -Encoding UTF8
Write-Host "Done."
