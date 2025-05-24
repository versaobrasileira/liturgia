# Caminho dos arquivos
$folder = ".\content"

# Carrega o index.json com UTF-8 explícito
$index = Get-Content "$folder\index.json" -Encoding UTF8 | ConvertFrom-Json

# Pega todos os arquivos únicos do index
$files = @()
foreach ($item in $index) {
    if ($item.file) { $files += $item.file }
    if ($item.hebrew) { $files += $item.hebrew }
    if ($item.portuguese) { $files += $item.portuguese }
}
$files = $files | Sort-Object -Unique

# Monta o objeto de saída
$filesContent = @{}
foreach ($filename in $files) {
    $path = Join-Path $folder $filename
    if (Test-Path $path) {
        # Lê cada arquivo explicitamente como UTF-8
        $filesContent[$filename] = Get-Content $path -Encoding UTF8 | ConvertFrom-Json
    } else {
        Write-Warning "$path não encontrado"
    }
}

$all = [ordered]@{
    index = $index
    files = $filesContent
}

# Salva o resultado em UTF-8
$all | ConvertTo-Json -Depth 100 | Set-Content "$folder\all.json" -Encoding UTF8

Write-Host "all.json gerado com $($files.Count) arquivos."
