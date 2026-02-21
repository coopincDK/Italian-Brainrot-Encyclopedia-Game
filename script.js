// ============================================
// ITALIAN BRAINROT - OPTIMIZED MAIN SCRIPT
// Performance-focused, clean code!
// ============================================

'use strict';

// ===== SERVICE WORKER REGISTRATION =====
// Disabled for file:// protocol compatibility
// Uncomment when running on a web server:
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('📦 Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}
*/

// ===== STATE =====
let allCharacters = [];
let currentFilter = 'ALL';
let chaosLevel = 0;
const maxChaos = 100;

// ===== BRAINROT SOUNDS =====
const BRAINROT_SOUNDS = [
    'Sound/01_italian_brainrot_ringtone.mp3',
    'Sound/02_tung_tung_tung_tung_sahur.mp3',
    'Sound/03_Strawberry_elephant_spawn_troll_steal_a_brainrot.mp3',
    'Sound/04_Steal_a_Brainrot_-_Dragon_Cannelloni.mp3',
    'Sound/06_Thick_Of_It_Brainrot.mp3',
    'Sound/07_balerina_capuchina.mp3',
    'Sound/08_Bobrito_Bandito_Italian_brainrot.mp3',
    'Sound/09_Sahur_song.mp3',
    'Sound/10_Tralalero_Tralala_Meme.mp3',
    'Sound/11_noo_la_policia.mp3',
    'Sound/12_Steal_a_Brainrot_-_Garama_and_Mandundung.mp3',
    'Sound/13_Trippi_Troppi_Italian_brainrot.mp3',
    'Sound/14_Meowl_Steal_a_Brainrot.mp3',
    'Sound/15_Udin_Din_Din_Dun.mp3',
    'Sound/16_Get_Out_MEMES.mp3',
    'Sound/17_Dragon_Cannelloni_Steal_A_Brainrot.mp3',
    'Sound/18_brainrot_ringtone.mp3',
    'Sound/19_drill_brainrot.mp3',
    'Sound/20_toilet_ananas_nasdas.mp3',
    'Sound/21_Brainrot_rap.mp3',
    'Sound/22_RickRoll_Tralalero_Tralala.mp3',
    'Sound/23_Steal_a_Brainrot_-_Los_Tralaleritos.mp3',
    'Sound/24_l├í_grande_Combonicione_de_brainrots.mp3',
    'Sound/25_garam_brainrot.mp3',
    'Sound/26_Brainrot_Phonk.mp3',
    'Sound/27_Steal_a_Brainrot_-_Job_Job_Job_Sahur.mp3',
    'Sound/28_Capuccino_Assasino_Italian_Brainrot.mp3',
    'Sound/29_oh_berinjela.mp3',
    'Sound/30_brainrot_cat.mp3',
    'Sound/31_mateooo_italian_brainrot_by_Tristank.mp3',
    'Sound/32_KSI_Thick_Of_It_Brainrot.mp3',
    'Sound/33_Hotspot_brainrot.mp3',
    'Sound/34_Steal_a_Brainrot_kid_cry.mp3',
    'Sound/35_Steal_a_Brainrot_-_Chicleteira_Bicicletera.mp3',
    'Sound/36_Anatoxic_-_Garamararamararaman.mp3',
    'Sound/37_my_mother_ate_fries.mp3',
    // 38_GYYAAAAAT og 71_GYAAAAAAAAAT er kun til jumpscare!
    'Sound/39_Trikitrakatelas_italian_brainrot.mp3',
    'Sound/40_Trullimero_Trullicina.mp3',
    'Sound/41_erm_what_the_sigma_full.mp3',
    'Sound/42_Steal_a_Brainrot_-_Karkerkar_Kurkur.mp3',
    'Sound/43_Bobrini_Cocococini.mp3',
    'Sound/44_tatata_sahur.mp3',
    'Sound/45_Steal_a_Brainrot_-_La_Vacca_Saturno_Saturnita.mp3',
    'Sound/46_Tung_Tung_Sahur_Song.mp3',
    'Sound/47_Steal_a_Brainrot_-_Esok_Sekolah.mp3',
    'Sound/48_Glorbo_Frutodrilo.mp3',
    'Sound/50_Skibidi_Fortnite_-_Cartel_Dealer.mp3',
    'Sound/51_Steal_a_Brainrot_-_Noobini_Pizzanini.mp3',
    'Sound/52_BRAINROT_SOUNDS.mp3',
    'Sound/53_Tricktrack_Bataboom.mp3',
    'Sound/54_Steal_a_Brainrot_-_Ketupat_Kepat.mp3',
    'Sound/55_Italian_brainrot.mp3',
    'Sound/56_what_help_me.mp3',
    'Sound/57_Steal_a_Brainrot_-_Pipi_Kiwi.mp3',
    'Sound/58_Steal_a_Brainrot_-_La_Supreme_Combinasion.mp3',
    'Sound/59_Steal_a_Brainrot_-_Tung_Tung_Tung_Sahur.mp3',
    'Sound/60_brain_rot_7000.mp3',
    'Sound/61_Richard_Ahh_Screaming.mp3',
    'Sound/62_Bobombini_Goosini_Italian_Brainrot.mp3',
    'Sound/63_Steal_a_Brainrot_-_Tralalero_Tralala.mp3',
    'Sound/64_Steal_a_Brainrot_-_Los_Combinasionas.mp3',
    'Sound/65_Last_sahur.mp3',
    'Sound/66_callate_ala_verga.mp3',
    'Sound/67_Bombardiro_Crocodilo.mp3',
    'Sound/68_Steal_a_Brainrot_-_Nuclearo_Dinossauro.mp3',
    'Sound/69_Larry_grave_Viens_l├á.mp3',
    'Sound/70_Ballarina_Cappucina.mp3',
    'Sound/72_Max_design_pro_-_What_Help_me.mp3'
];

let currentAudio = null;
let radioPlaying = false;
let audioUnlocked = false;

// Pre-create audio element for mobile compatibility
const radioAudio = new Audio();
radioAudio.volume = 0.7;

function toggleBrainrotRadio() {
    const btn = document.getElementById('random-sound-btn');
    
    if (radioPlaying) {
        // Stop radio
        radioPlaying = false;
        radioAudio.pause();
        radioAudio.currentTime = 0;
        if (btn) {
            btn.innerHTML = '📻 BRAINROT RADIO';
            btn.style.background = 'linear-gradient(145deg, #ff6600, #ffcc00)';
            btn.style.animation = 'none';
        }
    } else {
        // Start radio - play immediately in click handler for mobile!
        radioPlaying = true;
        if (btn) {
            btn.innerHTML = '⏹️ STOP RADIO';
            btn.style.background = 'linear-gradient(145deg, #ff0000, #cc0000)';
            btn.style.animation = 'radioPulse 1s ease-in-out infinite';
        }
        
        // Pick random sound and play IMMEDIATELY (important for mobile)
        const randomSound = BRAINROT_SOUNDS[Math.floor(Math.random() * BRAINROT_SOUNDS.length)];
        radioAudio.src = randomSound;
        
        // Play immediately - this is in the click handler so it works on mobile
        const playPromise = radioAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Radio play failed:', e);
                // Show user they need to tap again
                if (btn) {
                    btn.innerHTML = '🔊 TAP AGAIN';
                    setTimeout(() => {
                        if (!radioPlaying) btn.innerHTML = '📻 BRAINROT RADIO';
                    }, 2000);
                }
                radioPlaying = false;
            });
        }
    }
}

// When track ends, play next one
radioAudio.onended = () => {
    if (radioPlaying) {
        const randomSound = BRAINROT_SOUNDS[Math.floor(Math.random() * BRAINROT_SOUNDS.length)];
        radioAudio.src = randomSound;
        radioAudio.play().catch(e => console.log('Next track failed:', e));
    }
};

// Handle errors - try next track
radioAudio.onerror = () => {
    if (radioPlaying) {
        console.log('Track error, trying next...');
        const randomSound = BRAINROT_SOUNDS[Math.floor(Math.random() * BRAINROT_SOUNDS.length)];
        radioAudio.src = randomSound;
        radioAudio.play().catch(e => console.log('Recovery failed:', e));
    }
};

// Legacy function for backwards compatibility
function playRandomBrainrotSound() {
    toggleBrainrotRadio();
}

// Make it global
window.playRandomBrainrotSound = playRandomBrainrotSound;
window.toggleBrainrotRadio = toggleBrainrotRadio;

// ===== DOM CACHE =====
const DOMCache = {
    elements: new Map(),
    
    get(id) {
        if (!this.elements.has(id)) {
            const el = document.getElementById(id);
            if (el) this.elements.set(id, el);
            return el;
        }
        return this.elements.get(id);
    }
};

// ===== INITIALIZATION =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('🎭 Italian Brainrot initializing...');
    
    initLanguage();
    initParticles();
    initCharacters();
    initChaosSystem();
    
    // Preload images for better performance
    preloadImages();
}

// ===== PARTICLE SYSTEM (Optimized) =====
function initParticles() {
    const container = DOMCache.get('particles-container') || createParticlesContainer();
    if (!container) return;
    
    const emojis = ['🍕', '🍝', '🇮🇹', '🎭', '🧠', '💀', '🔥', '⭐', '🎪', '🎨'];
    const fragment = document.createDocumentFragment();
    
    // Create fewer particles for better performance
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${15 + Math.random() * 10}s;
            font-size: ${1.5 + Math.random() * 1.5}rem;
        `;
        fragment.appendChild(particle);
    }
    
    container.appendChild(fragment);
}

function createParticlesContainer() {
    const container = document.createElement('div');
    container.id = 'particles-container';
    container.className = 'particles-container';
    document.body.prepend(container);
    return container;
}

// ===== CHARACTER SYSTEM =====
function initCharacters() {
    const check = () => {
        if (window.italianBrainrotCharacters) {
            allCharacters = window.italianBrainrotCharacters;
            console.log('✅ Loaded:', allCharacters.length, 'characters');
            updateAlphabetNav();
            renderCharacters();
        } else {
            setTimeout(check, 100);
        }
    };
    check();
}

function updateAlphabetNav() {
    const nav = DOMCache.get('alphabet-nav');
    if (!nav) return;
    
    const letters = [...new Set(allCharacters.map(c => c.letter))].sort();
    const t = translations[currentLanguage] || translations.en;
    
    nav.innerHTML = `
        <button class="alphabet-btn active" onclick="filterByLetter('ALL', this)">${t.all || 'ALL'}</button>
        ${letters.map(letter => `
            <button class="alphabet-btn" onclick="filterByLetter('${letter}', this)">${letter}</button>
        `).join('')}
    `;
}

function filterByLetter(letter, element) {
    currentFilter = letter;
    
    // Update active button
    document.querySelectorAll('.alphabet-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    
    renderCharacters();
}

// ===== RENDER CHARACTERS (Optimized with Virtual Scrolling concept) =====
function renderCharacters() {
    const container = DOMCache.get('characters-grid');
    if (!container) return;
    
    let filtered = allCharacters;
    if (currentFilter !== 'ALL') {
        filtered = allCharacters.filter(c => c.letter === currentFilter);
    }
    
    if (filtered.length === 0) {
        const t = translations[currentLanguage] || translations.en;
        container.innerHTML = `<div class="loading">${t.noCharacters || 'No characters found!'} 🤷</div>`;
        return;
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    filtered.forEach((char, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.style.setProperty('--i', index);
        card.innerHTML = `
            <img class="character-image" 
                 src="${char.image}" 
                 alt="${char.name}"
                 loading="lazy"
                 onerror="this.src='images/placeholder.jpg'">
            <div class="character-emoji">${char.emoji}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-rarity">${char.rarity}</div>
        `;
        
        // Click handler
        card.addEventListener('click', () => openCharacterModal(char));
        
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

// ===== MODAL SYSTEM =====
let modalJustOpened = false;

function openCharacterModal(character) {
    console.log('💬 Opening modal for:', character.name);
    modalJustOpened = true;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const modal = DOMCache.get('character-modal');
    if (!modal) return;
    
    // Populate modal
    const img = DOMCache.get('modal-image');
    const emoji = DOMCache.get('modal-emoji');
    const name = DOMCache.get('modal-name');
    const rarity = DOMCache.get('modal-rarity');
    const desc = DOMCache.get('modal-description');
    
    if (img) img.src = character.image;
    if (emoji) emoji.textContent = character.emoji;
    if (name) name.textContent = character.name;
    if (rarity) rarity.textContent = character.rarity;
    
    // Get translated description - check BATCH_3_DESCRIPTIONS first for long descriptions
    if (desc) {
        const lang = currentLanguage || 'en';
        let description = character.description;
        
        console.log('🔍 Description lookup:', {
            name: character.name,
            lang: lang,
            hasBatch1: typeof BATCH_1_DESCRIPTIONS !== 'undefined',
            hasEntry: BATCH_1_DESCRIPTIONS && BATCH_1_DESCRIPTIONS[character.name],
            defaultDesc: character.description
        });
        
        // Check for long description in BATCH_1_DESCRIPTIONS (consolidated file)
        if (typeof BATCH_1_DESCRIPTIONS !== 'undefined' && BATCH_1_DESCRIPTIONS[character.name]) {
            // Try current language first
            if (BATCH_1_DESCRIPTIONS[character.name][lang] && BATCH_1_DESCRIPTIONS[character.name][lang].trim() !== '') {
                description = BATCH_1_DESCRIPTIONS[character.name][lang];
                console.log('✅ Using', lang, 'description:', description.substring(0, 50) + '...');
            }
            // Fallback to English if current language is empty
            else if (BATCH_1_DESCRIPTIONS[character.name]['en'] && BATCH_1_DESCRIPTIONS[character.name]['en'].trim() !== '') {
                description = BATCH_1_DESCRIPTIONS[character.name]['en'];
                console.log('✅ Using EN fallback:', description.substring(0, 50) + '...');
            }
        } else if (character.descriptions && character.descriptions[lang]) {
            description = character.descriptions[lang];
            console.log('✅ Using character.descriptions');
        }
        
        console.log('📝 Final description length:', description.length);
        desc.textContent = description;
    }
    
    // Speak name first (Italian voice), then description (language-matched voice)
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const voices = speechSynthesis.getVoices();
        const lang = currentLanguage || 'en';
        
        // Get description for reading - check all batch files
        let descriptionToRead = character.description;
        
        // Check BATCH_1_DESCRIPTIONS (consolidated file)
        if (typeof BATCH_1_DESCRIPTIONS !== 'undefined' && BATCH_1_DESCRIPTIONS[character.name]) {
            // Try current language first
            if (BATCH_1_DESCRIPTIONS[character.name][lang] && BATCH_1_DESCRIPTIONS[character.name][lang].trim() !== '') {
                descriptionToRead = BATCH_1_DESCRIPTIONS[character.name][lang];
            }
            // Fallback to English if current language is empty
            else if (BATCH_1_DESCRIPTIONS[character.name]['en'] && BATCH_1_DESCRIPTIONS[character.name]['en'].trim() !== '') {
                descriptionToRead = BATCH_1_DESCRIPTIONS[character.name]['en'];
            }
        }
        // Fallback to character.descriptions
        else if (character.descriptions && character.descriptions[lang]) {
            descriptionToRead = character.descriptions[lang];
        }
        
        // 1. First speak the NAME (Italian voice for authentic brainrot)
        const nameUtterance = new SpeechSynthesisUtterance(character.name);
        nameUtterance.rate = 0.9;
        nameUtterance.pitch = 1.1;
        nameUtterance.volume = 1.0;
        
        const italianVoice = voices.find(v => v.lang.includes('it'));
        if (italianVoice) {
            nameUtterance.voice = italianVoice;
        }
        
        // 2. Then speak the DESCRIPTION (voice matches selected language)
        nameUtterance.onend = () => {
            const descUtterance = new SpeechSynthesisUtterance(descriptionToRead);
            descUtterance.rate = 0.9;   // Slower = clearer, more natural
            descUtterance.pitch = 1.1;  // Slightly higher = more engaging
            descUtterance.volume = 1.0;
            
            // Find the BEST voice for each language (prefer natural/premium voices)
            const targetLang = lang || 'en';
            
            // Sort voices to prefer: 1) Natural/Premium, 2) Female, 3) First match
            const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetLang));
            
            let bestVoice = null;
            
            // Try to find a "natural" or "premium" voice first (these sound better)
            bestVoice = langVoices.find(v => 
                v.name.toLowerCase().includes('natural') || 
                v.name.toLowerCase().includes('premium') ||
                v.name.toLowerCase().includes('neural')
            );
            
            // If no premium, try to find a good quality voice
            if (!bestVoice) {
                bestVoice = langVoices.find(v => 
                    !v.name.toLowerCase().includes('compact') &&
                    !v.name.toLowerCase().includes('espeak')
                );
            }
            
            // Fallback to any matching voice
            if (!bestVoice && langVoices.length > 0) {
                bestVoice = langVoices[0];
            }
            
            // Last resort: find any voice containing the language code
            if (!bestVoice) {
                bestVoice = voices.find(v => v.lang.includes(targetLang));
            }
            
            if (bestVoice) {
                descUtterance.voice = bestVoice;
                console.log(`🔊 Using voice: ${bestVoice.name} (${bestVoice.lang})`);
            }
            
            speechSynthesis.speak(descUtterance);
        };
        
        speechSynthesis.speak(nameUtterance);
    }
    
    // Show modal - force display with important
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    document.body.style.overflow = 'hidden';
    
    console.log('Modal should be visible now');
    
    // Allow closing after short delay
    setTimeout(() => { modalJustOpened = false; }, 300);
}

function closeCharacterModal(event) {
    if (modalJustOpened) return;
    if (event && event.target.closest('.modal-content') && !event.target.closest('.modal-close')) return;
    
    // Stop any ongoing speech when closing modal
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    
    const modal = DOMCache.get('character-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===== CHAOS SYSTEM =====
function initChaosSystem() {
    document.body.style.setProperty('--chaos-level', '0');
    console.log('💥 Chaos system ready');
}

function increaseChaos() {
    if (chaosLevel < maxChaos) {
        chaosLevel += 2;
        updateChaosEffects();
    }
}

function resetChaos() {
    chaosLevel = 0;
    updateChaosEffects();
    
    const body = document.body;
    body.classList.remove('chaos-low', 'chaos-medium', 'chaos-high', 'chaos-extreme');
    body.style.removeProperty('--chaos-level');
    body.style.removeProperty('--shake-intensity');
    body.style.removeProperty('--rotation-intensity');
    body.style.removeProperty('--glow-intensity');
}

function updateChaosEffects() {
    const body = document.body;
    const intensity = chaosLevel / maxChaos;
    const percentage = Math.round(intensity * 100);
    
    // Update CSS variables
    body.style.setProperty('--chaos-level', intensity);
    body.style.setProperty('--shake-intensity', (intensity * 5) + 'px');
    body.style.setProperty('--rotation-intensity', (intensity * 2) + 'deg');
    body.style.setProperty('--glow-intensity', (intensity * 50) + 'px');
    
    // Update chaos meter
    const fill = DOMCache.get('chaos-fill');
    const text = DOMCache.get('chaos-text');
    
    if (fill) fill.style.width = percentage + '%';
    
    if (text) {
        const emojis = ['😌', '😅', '🤪', '🤯'];
        const emojiIndex = Math.min(3, Math.floor(intensity * 4));
        text.textContent = percentage + '% ' + emojis[emojiIndex];
    }
    
    // Update body class
    body.classList.remove('chaos-low', 'chaos-medium', 'chaos-high', 'chaos-extreme');
    
    if (intensity >= 0.75) body.classList.add('chaos-extreme');
    else if (intensity >= 0.5) body.classList.add('chaos-high');
    else if (intensity >= 0.25) body.classList.add('chaos-medium');
    else if (intensity > 0) body.classList.add('chaos-low');
}

// ===== IMAGE PRELOADING =====
function preloadImages() {
    // Preload first 20 character images (with error handling for file:// protocol)
    const toPreload = allCharacters.slice(0, 20);
    
    toPreload.forEach(char => {
        const img = new Image();
        img.onerror = () => console.log('⚠️ Could not preload:', char.image);
        img.src = char.image;
    });
    
    // Preload jumpscare
    const jumpscare = new Image();
    jumpscare.onerror = () => console.log('⚠️ Could not preload jumpscare');
    jumpscare.src = 'images/jumpscare.jpeg';
}

// ===== FOOTER CHARACTERS =====
function updateFooterCharacters() {
    const container = document.querySelector('.footer-characters');
    if (!container || allCharacters.length === 0) return;
    
    const sample = allCharacters
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(c => c.emoji);
    
    container.innerHTML = sample.map((emoji, i) => `
        <span class="footer-character" style="--i: ${i}">${emoji}</span>
    `).join('');
}

// ===== GLOBAL 1% JUMPSCARE =====
let globalJumpscareReady = true;

function triggerGlobalJumpscare() {
    if (!globalJumpscareReady) return;
    globalJumpscareReady = false;
    
    console.log('💀💀💀 GLOBAL JUMPSCARE! 💀💀💀');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const duration = 2500;
    
    // Create TERRIFYING overlay
    const overlay = document.createElement('div');
    overlay.id = 'global-jumpscare';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: linear-gradient(45deg, #ff0000, #000, #ff0000, #000);
        background-size: 800% 800%;
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: jumpscareFlashChaos 0.03s infinite, jumpscareZoom 0.1s infinite;
        overflow: hidden;
    `;
    
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.id = 'jumpscare-style';
    style.textContent = `
        @keyframes jumpscareFlashChaos {
            0% { filter: brightness(3) contrast(2) saturate(3) hue-rotate(0deg); }
            25% { filter: brightness(0.5) contrast(3) saturate(5) hue-rotate(90deg); }
            50% { filter: brightness(4) contrast(1.5) saturate(2) hue-rotate(180deg); }
            75% { filter: brightness(0.3) contrast(4) saturate(4) hue-rotate(270deg); }
            100% { filter: brightness(3) contrast(2) saturate(3) hue-rotate(360deg); }
        }
        @keyframes jumpscareZoom {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.3) rotate(5deg); }
            50% { transform: scale(0.9) rotate(-5deg); }
            75% { transform: scale(1.2) rotate(3deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes jumpscareShakeExtreme {
            0% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
            10% { transform: translate(-30px, 30px) scale(1.3) rotate(10deg); }
            20% { transform: translate(30px, -30px) scale(1.1) rotate(-10deg); }
            30% { transform: translate(-25px, -25px) scale(1.4) rotate(8deg); }
            40% { transform: translate(25px, 25px) scale(1.0) rotate(-8deg); }
            50% { transform: translate(-20px, 20px) scale(1.5) rotate(12deg); }
            60% { transform: translate(20px, -20px) scale(1.2) rotate(-12deg); }
            70% { transform: translate(-15px, -15px) scale(1.3) rotate(6deg); }
            80% { transform: translate(15px, 15px) scale(1.1) rotate(-6deg); }
            90% { transform: translate(-10px, 10px) scale(1.4) rotate(4deg); }
            100% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
        }
        @keyframes bloodDrip {
            0% { top: -100%; }
            100% { top: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    // Main scary image - FILLS THE SCREEN
    const img = document.createElement('img');
    img.src = 'images/jumpscare.jpeg';
    img.onerror = () => { img.src = 'images/tung-tung-hurar-tung-tung-tung-sahur.jpg.jpeg'; };
    img.style.cssText = `
        width: 120%;
        height: 120%;
        object-fit: cover;
        animation: jumpscareShakeExtreme 0.02s infinite;
        filter: contrast(1.5) saturate(1.5);
    `;
    overlay.appendChild(img);
    
    // Add blood drip effect
    for (let i = 0; i < 5; i++) {
        const blood = document.createElement('div');
        blood.style.cssText = `
            position: absolute;
            width: ${20 + Math.random() * 30}%;
            height: 200%;
            background: linear-gradient(to bottom, transparent, #8B0000, #FF0000, #8B0000, transparent);
            left: ${Math.random() * 100}%;
            top: -100%;
            animation: bloodDrip ${1 + Math.random()}s linear infinite;
            animation-delay: ${Math.random() * 0.5}s;
            opacity: 0.7;
            mix-blend-mode: multiply;
        `;
        overlay.appendChild(blood);
    }
    
    // Add scary text
    const text = document.createElement('div');
    text.textContent = '💀 BOO! 💀';
    text.style.cssText = `
        position: absolute;
        font-family: 'Creepster', 'Bangers', cursive;
        font-size: 8rem;
        color: #FF0000;
        text-shadow: 
            0 0 20px #FF0000,
            0 0 40px #FF0000,
            0 0 60px #FF0000,
            4px 4px 0 #000,
            -4px -4px 0 #000;
        animation: jumpscareZoom 0.05s infinite;
        z-index: 10;
        pointer-events: none;
    `;
    overlay.appendChild(text);
    
    document.body.appendChild(overlay);
    
    // Play LOUD scream - GYAAAAAAAAAT!
    const gyaaatSound = new Audio('SOUND/71_GYAAAAAAAAAT_bass_boosted.mp3');
    gyaaatSound.volume = 1.0;
    gyaaatSound.play().catch(() => {
        // Try alternate sounds
        const alt = new Audio('SOUND/38_GYYAAAAAT.mp3');
        alt.volume = 1.0;
        alt.play().catch(() => {});
    });
    
    // Vibrate device if supported (mobile)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200, 50, 300]);
    }
    
    // Remove after duration
    setTimeout(() => {
        overlay.remove();
        const styleEl = document.getElementById('jumpscare-style');
        if (styleEl) styleEl.remove();
        
        // Cooldown - can't trigger again for 30 seconds
        setTimeout(() => {
            globalJumpscareReady = true;
        }, 30000);
    }, duration);
}

// Global click listener - 1% chance!
document.addEventListener('click', (e) => {
    // Don't trigger if jumpscare overlay is showing
    if (document.getElementById('global-jumpscare')) return;
    if (document.getElementById('jumpscare-overlay')) return;
    
    // 1% chance
    if (Math.random() < 0.01) {
        triggerGlobalJumpscare();
    }
});

// ===== PWA INSTALL FUNCTIONALITY =====
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
const pwaPopup = document.getElementById('pwa-popup');

// Check if mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if popup was dismissed
function wasPopupDismissed() {
    const dismissed = localStorage.getItem('pwa-popup-dismissed');
    if (!dismissed) return false;
    const dismissedTime = parseInt(dismissed);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed < 7; // Show again after 7 days
}

// Show PWA popup on mobile
function showPWAPopup() {
    if (pwaPopup && isMobileDevice() && !wasPopupDismissed()) {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            return; // Already installed
        }
        
        // Show popup after 2 seconds
        setTimeout(() => {
            pwaPopup.style.display = 'flex';
            
            // Update popup text for iOS Chrome users
            if (isIOSChrome()) {
                const installBtn = pwaPopup.querySelector('.pwa-popup-install span');
                const desc = pwaPopup.querySelector('[data-translate="pwaPopupDesc"]');
                const lang = localStorage.getItem('language') || 'en';
                const messages = {
                    en: { desc: 'Please open this page in Safari to install', btn: 'Open in Safari' },
                    de: { desc: 'Bitte öffnen Sie diese Seite in Safari zum Installieren', btn: 'In Safari öffnen' },
                    es: { desc: 'Por favor abre esta página en Safari para instalar', btn: 'Abrir en Safari' },
                    da: { desc: 'Vænligst åbn denne side i Safari for at installere', btn: 'Åbn i Safari' },
                    it: { desc: 'Apri questa pagina in Safari per installare', btn: 'Apri in Safari' }
                };
                if (desc) desc.textContent = messages[lang]?.desc || messages.en.desc;
                if (installBtn) installBtn.textContent = messages[lang]?.btn || messages.en.btn;
            }
        }, 2000);
    }
}

// Show popup on page load for iOS (no beforeinstallprompt event)
if (isMobileDevice() && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.addEventListener('load', () => {
        showPWAPopup();
    });
}

// Close PWA popup
function closePWAPopup() {
    if (pwaPopup) {
        pwaPopup.style.display = 'none';
        localStorage.setItem('pwa-popup-dismissed', Date.now().toString());
    }
}

// Install from popup
function installFromPopup() {
    installApp();
    closePWAPopup();
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    if (installBtn) {
        installBtn.style.display = 'inline-block';
    }
    // Show popup on mobile
    showPWAPopup();
});

// Install app function
function installApp() {
    // Check if iOS Chrome/non-Safari browser
    if (isIOSChrome()) {
        showSafariRedirect();
        return;
    }
    
    if (!deferredPrompt) {
        // Fallback for iOS Safari - show instructions
        if (isIOS()) {
            showIOSInstructions();
        }
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        // Hide the install button
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    });
}

// Check if iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Check if iOS Chrome/non-Safari browser
function isIOSChrome() {
    return isIOS() && /CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
}

// Show Safari redirect message for iOS Chrome users
function showSafariRedirect() {
    const lang = localStorage.getItem('language') || 'en';
    const messages = {
        en: '🍎 iOS Limitation\n\nTo install this app on iPhone, please open this page in Safari browser.\n\nChrome on iOS cannot install web apps due to Apple restrictions.',
        de: '🍎 iOS-Einschränkung\n\nUm diese App auf dem iPhone zu installieren, öffnen Sie diese Seite bitte im Safari-Browser.\n\nChrome auf iOS kann aufgrund von Apple-Beschränkungen keine Web-Apps installieren.',
        es: '🍎 Limitación de iOS\n\nPara instalar esta aplicación en iPhone, abre esta página en el navegador Safari.\n\nChrome en iOS no puede instalar aplicaciones web debido a restricciones de Apple.',
        da: '🍎 iOS Begrænsning\n\nFor at installere denne app på iPhone, skal du åbne denne side i Safari-browseren.\n\nChrome på iOS kan ikke installere web-apps på grund af Apple-restriktioner.',
        it: '🍎 Limitazione iOS\n\nPer installare questa app su iPhone, apri questa pagina nel browser Safari.\n\nChrome su iOS non può installare app web a causa delle restrizioni di Apple.'
    };
    alert(messages[lang] || messages.en);
}

// Show iOS installation instructions
function showIOSInstructions() {
    const lang = localStorage.getItem('language') || 'en';
    const messages = {
        en: 'To install on iOS:\n1. Tap the Share button ⬆️\n2. Scroll down and tap "Add to Home Screen" 📱\n3. Tap "Add" in the top right',
        de: 'Auf iOS installieren:\n1. Tippen Sie auf die Teilen-Schaltfläche ⬆️\n2. Scrollen Sie nach unten und tippen Sie auf "Zum Home-Bildschirm" 📱\n3. Tippen Sie oben rechts auf "Hinzufügen"',
        es: 'Para instalar en iOS:\n1. Toca el botón Compartir ⬆️\n2. Desplázate hacia abajo y toca "Añadir a pantalla de inicio" 📱\n3. Toca "Añadir" en la parte superior derecha',
        da: 'Sådan installeres på iOS:\n1. Tryk på Del-knappen ⬆️\n2. Rul ned og tryk på "Føj til hjemmeskærm" 📱\n3. Tryk på "Tilføj" øverst til højre',
        it: 'Per installare su iOS:\n1. Tocca il pulsante Condividi ⬆️\n2. Scorri verso il basso e tocca "Aggiungi a schermata Home" 📱\n3. Tocca "Aggiungi" in alto a destra'
    };
    alert(messages[lang] || messages.en);
}

// Hide install button if already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});

// Check if already installed (standalone mode)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// ===== GLOBAL EXPORTS =====
window.filterByLetter = filterByLetter;
window.openCharacterModal = openCharacterModal;
window.closeCharacterModal = closeCharacterModal;
window.increaseChaos = increaseChaos;
window.resetChaos = resetChaos;
window.triggerGlobalJumpscare = triggerGlobalJumpscare;
window.installApp = installApp;
window.closePWAPopup = closePWAPopup;
window.installFromPopup = installFromPopup;
