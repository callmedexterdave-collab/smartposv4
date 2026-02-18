# Export all text source files under this folder into a single file
# Usage: run in PowerShell from the repository root:
#   cd 'c:\Users\LENOVO\Downloads\smarpos - backup-v2\BudgetManager'
#   .\export-all-sources.ps1

$root = Get-Location
$out = Join-Path $root "BudgetManager-all-sources.txt"
if (Test-Path $out) { Remove-Item $out -Force }

# File extensions to include
$include = @('*.ts','*.tsx','*.js','*.jsx','*.json','*.md','*.html','*.css','*.txt','*.ps1','*.toml','*.cfg','*.yml','*.yaml')

# Exclude binary and large artifacts
$excludeDirs = @('.git','node_modules','.local')
$excludeFiles = @('*.zip','*.db','*.bin','*.png','*.jpg','*.jpeg','*.gif','*.ico','*.sqlite','*.exe')

function ShouldIncludeFile($file) {
    foreach ($pat in $excludeFiles) {
        if ($file.Name -like $pat) { return $false }
    }
    foreach ($dir in $excludeDirs) {
        if ($file.FullName -like "*\\$dir\\*") { return $false }
    }
    return $true
}

Write-Output "Exporting files to $out"

foreach ($pat in $include) {
    Get-ChildItem -Path $root -Recurse -Filter $pat -File -ErrorAction SilentlyContinue | Sort-Object FullName | ForEach-Object {
        if (-not (ShouldIncludeFile $_)) { return }
        $path = $_.FullName
        $rel = $path.Substring($root.Path.Length).TrimStart('\')
        Add-Content -Path $out -Value "===== FILE: $rel ====="
        try {
            Get-Content -Path $path -Raw -ErrorAction Stop | Out-File -FilePath $out -Append -Encoding UTF8
        } catch {
            Add-Content -Path $out -Value "-- ERROR: Failed to read file content --"
        }
        Add-Content -Path $out -Value "`n`n"
    }
}

Write-Output "Done. Output: $out"
