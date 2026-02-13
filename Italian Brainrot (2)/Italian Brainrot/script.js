// ============================================
// ITALIAN BRAINROT - INTERACTIVE 3D SCRIPT
// ============================================

var allCharacters = [];
var currentFilter = 'ALL';
var chaosLevel = 0; // Starter på 0 (rolig)
var maxChaos = 100; // Maksimum kaos niveau

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('🎭 Italian Brainrot initialiserer...');
    initLanguage();
    createParticles();
    initCharacters();
    initChaosSystem();
}

function initChaosSystem() {
    // Start uden kaos
    document.body.style.setProperty('--chaos-level', '0');
    
    console.log('💥 Kaos-system initialiseret - starter roligt!');
    console.log('🎮 Kaos vil kun øge i KAOS MODE under spillet!');
}

function increaseChaos() {
    if (chaosLevel < maxChaos) {
        chaosLevel += 2; // Øg med 2 per klik
        updateChaosEffects();
        console.log('🔥 Kaos niveau:', chaosLevel + '/' + maxChaos);
    }
}

// Eksporter funktioner til game.js
window.increaseChaos = increaseChaos;

window.resetChaos = function() {
    console.log('💫 Resetter kaos til 0...');
    chaosLevel = 0;
    updateChaosEffects();
    
    // Aggressiv reset - fjern alle kaos-effekter
    var body = document.body;
    body.classList.remove('chaos-low', 'chaos-medium', 'chaos-high', 'chaos-extreme');
    body.style.removeProperty('--chaos-level');
    body.style.removeProperty('--shake-intensity');
    body.style.removeProperty('--rotation-intensity');
    body.style.removeProperty('--glow-intensity');
    
    console.log('✅ Alle kaos-effekter fjernet!');
};

function updateChaosEffects() {
    var body = document.body;
    var intensity = chaosLevel / maxChaos; // 0 til 1
    var percentage = Math.round(intensity * 100);
    
    // Opdater CSS variable
    body.style.setProperty('--chaos-level', intensity);
    body.style.setProperty('--shake-intensity', (intensity * 5) + 'px');
    body.style.setProperty('--rotation-intensity', (intensity * 2) + 'deg');
    body.style.setProperty('--glow-intensity', (intensity * 50) + 'px');
    
    // Opdater kaos-meter
    var chaosFill = document.getElementById('chaos-fill');
    var chaosText = document.getElementById('chaos-text');
    
    if (chaosFill) {
        chaosFill.style.width = percentage + '%';
    }
    
    if (chaosText) {
        var emoji = '😌';
        if (intensity < 0.25) {
            emoji = '😌'; // Rolig
        } else if (intensity < 0.5) {
            emoji = '😅'; // Lidt crazy
        } else if (intensity < 0.75) {
            emoji = '🤪'; // Meget crazy
        } else {
            emoji = '🤯'; // VANVITTIGT!
        }
        chaosText.textContent = percentage + '% ' + emoji;
    }
    
    // Tilføj kaos-klasse baseret på niveau
    body.classList.remove('chaos-low', 'chaos-medium', 'chaos-high', 'chaos-extreme');
    
    if (intensity === 0) {
        // Ingen kaos - fjern alle klasser
    } else if (intensity < 0.25) {
        body.classList.add('chaos-low');
    } else if (intensity < 0.5) {
        body.classList.add('chaos-medium');
    } else if (intensity < 0.75) {
        body.classList.add('chaos-high');
    } else {
        body.classList.add('chaos-extreme');
    }
}

function initCharacters() {
    console.log('🔄 initCharacters kaldt... window.italianBrainrotCharacters:', window.italianBrainrotCharacters ? 'LOADED' : 'IKKE LOADED');
    if (window.italianBrainrotCharacters) {
        allCharacters = window.italianBrainrotCharacters;
        console.log('✅ Indlæst:', allCharacters.length, 'karakterer');
        console.log('📝 Første karakter:', allCharacters[0]);
        updateAlphabetNav();
        renderCharacters();
    } else {
        console.log('⏳ Venter på characters.js...');
        setTimeout(initCharacters, 100);
    }
}

function updateAlphabetNav() {
    // Find which letters have characters
    var usedLetters = new Set();
    allCharacters.forEach(function(c) {
        if (c.letter) {
            usedLetters.add(c.letter.toUpperCase());
        }
    });
    
    // Hide buttons for unused letters
    document.querySelectorAll('.letter-btn').forEach(function(btn) {
        var letter = btn.textContent.trim();
        if (letter !== 'ALLE' && !usedLetters.has(letter)) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
        }
    });
    
    console.log('📝 Aktive bogstaver:', Array.from(usedLetters).sort().join(', '));
}

function filterByLetter(letter, element) {
    currentFilter = letter;
    console.log('🔍 Filtrer:', letter);
    
    // Update active button
    document.querySelectorAll('.letter-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    renderCharacters();
}

function renderCharacters() {
    console.log('🎨 renderCharacters kaldt! allCharacters.length:', allCharacters.length);
    var container = document.getElementById('characters-grid');
    if (!container) {
        console.error('❌ Container ikke fundet!');
        return;
    }
    
    console.log('📦 Container fundet:', container);
    container.innerHTML = '';
    
    var filtered = allCharacters;
    console.log('🔍 currentFilter:', currentFilter);
    if (currentFilter !== 'ALL') {
        filtered = allCharacters.filter(function(c) {
            return c.letter === currentFilter;
        });
    }
    
    console.log('📦 Viser:', filtered.length, 'karakterer');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">INGEN KARAKTERER FUNDET! 🤷‍♂️</div>';
        return;
    }
    
    filtered.forEach(function(char) {
        var card = document.createElement('div');
        card.className = 'character-card';
        card.style.borderColor = char.color;
        
        var imageHtml = '';
        if (char.image) {
            imageHtml = '<div class="character-image-wrapper"><img src="' + char.image + '" alt="' + char.name + '" class="character-image" onerror="this.parentElement.innerHTML=\'<div class=\\\'character-emoji-large\\\'>' + char.emoji + '</div>\';"><div class="image-glow" style="background: radial-gradient(circle, ' + char.color + '40, transparent);"></div></div>';
        } else {
            imageHtml = '<div class="character-image-wrapper"><div class="character-emoji-large">' + char.emoji + '</div></div>';
        }
        
        card.innerHTML = 
            imageHtml +
            '<div class="character-emoji-small">' + char.emoji + '</div>' +
            '<h3 class="character-name" style="color: ' + char.color + ';">' + char.name + '</h3>' +
            '<div class="character-rarity">' + char.rarity + '</div>' +
            '<p class="character-description">' + char.description + '</p>';
        
        // Tilføj click event til at åbne modal
        card.addEventListener('click', function() {
            openCharacterModal(char);
        });
        
        container.appendChild(card);
    });
}

function createParticles() {
    var particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    var emojis = ['🍕', '🍝', '☕', '🦈', '🐊', '🦆', '🐵', '🌯', '🦀', '🐙', '🦫', '🐘', '🐄', '🐫'];
    
    for (var i = 0; i < 30; i++) {
        var particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// CHARACTER MODAL FUNCTIONS
// ============================================

var modalJustOpened = false;

function openCharacterModal(character) {
    console.log('💬 Åbner modal for:', character.name);
    modalJustOpened = true;
    
    var modal = document.getElementById('character-modal');
    console.log('Modal element:', modal);
    
    if (!modal) {
        console.error('❌ Modal element ikke fundet!');
        return;
    }
    
    var modalImage = document.getElementById('modal-image');
    var modalEmoji = document.getElementById('modal-emoji');
    var modalName = document.getElementById('modal-name');
    var modalRarity = document.getElementById('modal-rarity');
    var modalDescription = document.getElementById('modal-description');
    
    console.log('Modal elementer:', {modalImage, modalEmoji, modalName, modalRarity, modalDescription});
    
    // Opdater modal indhold
    modalImage.src = character.image;
    modalImage.alt = character.name;
    modalEmoji.textContent = character.emoji;
    modalName.textContent = character.name;
    modalRarity.textContent = character.rarity;
    
    // Brug beskrivelse baseret på valgt sprog
    var description = character.description; // Default (dansk)
    if (currentLanguage === 'en' && character.descriptionEN) {
        description = character.descriptionEN;
    } else if (currentLanguage === 'de' && character.descriptionDE) {
        description = character.descriptionDE;
    } else if (currentLanguage === 'es' && character.descriptionES) {
        description = character.descriptionES;
    }
    modalDescription.textContent = description;
    
    // Sig karakterens navn!
    if ('speechSynthesis' in window) {
        var utterance = new SpeechSynthesisUtterance(character.name);
        utterance.rate = 1.2;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
        console.log('🗣️ Siger:', character.name);
    }
    
    // Scroll til top så modal er synlig
    window.scrollTo(0, 0);
    
    // Vis modal
    console.log('💬 Viser modal...');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.pointerEvents = 'auto';
    console.log('💬 Modal display sat til:', modal.style.display);
    console.log('💬 Modal computed style:', window.getComputedStyle(modal).display);
    document.body.style.overflow = 'hidden'; // Disable scroll
    console.log('✅ Modal skulle nu være synlig!');
    console.log('📦 Modal indhold:', {image: modalImage.src, name: modalName.textContent, emoji: modalEmoji.textContent});
    
    // Tillad lukning efter 300ms
    setTimeout(function() {
        modalJustOpened = false;
    }, 300);
}

function closeCharacterModal(event) {
    // Ignorer hvis modal lige er åbnet
    if (modalJustOpened) {
        console.log('⏸️ Modal lige åbnet - ignorerer lukning');
        return;
    }
    
    // Luk kun hvis man klikker på overlay eller close button
    if (!event || event.target.id === 'character-modal' || event.target.className === 'modal-close') {
        var modal = document.getElementById('character-modal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Enable scroll
        console.log('❌ Modal lukket');
    }
}

// Luk modal med ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCharacterModal();
    }
});

console.log('🚀 Script indlæst!');
