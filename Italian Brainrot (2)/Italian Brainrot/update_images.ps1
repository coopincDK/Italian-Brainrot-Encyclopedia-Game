# Script til at opdatere billede-links i characters.js
$content = Get-Content "characters.js" -Raw

# Erstat alle Picsum links med placeholder
$content = $content -replace "image: 'https://picsum\.photos/seed/\w+/400'", "image: 'images/PLACEHOLDER.jpg'"

# Gem filen
Set-Content "characters.js" -Value $content -NoNewline

Write-Host "Opdateret characters.js - alle Picsum links erstattet med placeholder"
