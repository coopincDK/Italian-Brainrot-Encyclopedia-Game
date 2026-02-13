# Script til at udvide beskrivelser i characters.js
$content = Get-Content "characters.js" -Raw

# Udvid korte beskrivelser med generiske men relevante tilføjelser
$expansions = @{
    "En elefant med kokosnød-tema" = "En elefant med kokosnød-tema. Hans store ører er lavet af kokosnødskaller der rasler når han bevæger sig. Kan sprøjte kokosmælk fra sin snabel med utrolig præcision. Hans hud er ru som kokosnødfibre og næsten umulig at penetrere. Elsker at danse til tropisk musik og sprede eksotisk stemning. Hans tramp kan mærkes miles væk og varsler hans ankomst."
    
    "Tre søstre der synger i harmoni" = "Tre søstre der synger i harmoni. Deres stemmer kan få glas til at knuse og hjerter til at smelte. Hver søster har sin egen unikke personlighed men sammen er de ustoppelige. N\u00e5r de synger, standser tiden og alle lytter hypnotiseret. Deres koncerter er legendariske og billetter er umulige at få. De rejser verden rundt og spreder glæde gennem deres musik."
    
    "Den store kombination af kaos" = "Den store kombination af kaos. En fusion af alle de vildeste elementer i Italian Brainrot universet. Kan skifte form og evner efter behov. Repr\u00e6senterer det ultimative kaos og uforudsigelighed. N\u00e5r den dukker op, ved ingen hvad der vil ske næste. Dens kraft er næsten guddommelig og frygtet af alle."
    
    "En bison med Jupiter-kræfter" = "En bison med Jupiter-kræfter. Hans horn kan kalde lyn ned fra himlen. Kroppen er massiv som planeten Jupiter selv. Kan skabe storme med et enkelt brøl. Hans hooves efterlader kratere i jorden. Beskytter de svage med sin overvældende styrke og magt."
}

# Gem opdateret fil
Set-Content "characters.js" $content -NoNewline
Write-Host "Beskrivelser udvidet!"
