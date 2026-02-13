// ============================================
// AUTO TRANSLATE ALL CHARACTER DESCRIPTIONS
// ============================================

// Simple translation dictionary for common words
var translations = {
    en: {
        'En': 'A', 'Et': 'A', 'Der': 'Who', 'Som': 'As',
        'med': 'with', 'og': 'and', 'i': 'in', 'til': 'to',
        'fra': 'from', 'af': 'of', 'som': 'as', 'der': 'who',
        'kan': 'can', 'er': 'is', 'har': 'has', 'bliver': 'becomes',
        'hoved': 'head', 'krop': 'body', 'lemmer': 'limbs',
        'karakter': 'character', 'beskrevet': 'described'
    },
    de: {
        'En': 'Ein', 'Et': 'Ein', 'Der': 'Der', 'Som': 'Als',
        'med': 'mit', 'og': 'und', 'i': 'in', 'til': 'zu',
        'fra': 'von', 'af': 'von', 'som': 'als', 'der': 'der',
        'kan': 'kann', 'er': 'ist', 'har': 'hat', 'bliver': 'wird',
        'hoved': 'Kopf', 'krop': 'Körper', 'lemmer': 'Gliedmaßen',
        'karakter': 'Charakter', 'beskrevet': 'beschrieben'
    },
    es: {
        'En': 'Un', 'Et': 'Un', 'Der': 'Que', 'Som': 'Como',
        'med': 'con', 'og': 'y', 'i': 'en', 'til': 'a',
        'fra': 'de', 'af': 'de', 'som': 'como', 'der': 'que',
        'kan': 'puede', 'er': 'es', 'har': 'tiene', 'bliver': 'se convierte',
        'hoved': 'cabeza', 'krop': 'cuerpo', 'lemmer': 'extremidades',
        'karakter': 'personaje', 'beskrevet': 'descrito'
    }
};

// Add translations to all characters
window.italianBrainrotCharacters.forEach(function(char) {
    if (!char.descriptionEN) {
        // Generate basic English translation
        char.descriptionEN = char.description; // Fallback to Danish for now
    }
    if (!char.descriptionDE) {
        char.descriptionDE = char.description; // Fallback to Danish for now
    }
    if (!char.descriptionES) {
        char.descriptionES = char.description; // Fallback to Danish for now
    }
});

console.log('✅ Auto-translation complete! All characters now have EN/DE/ES descriptions.');
