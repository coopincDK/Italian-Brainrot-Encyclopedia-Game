// ============================================
// ITALIAN BRAINROT - ULTRA SVÆRT SPIL
// Hastigheds-bonus + Instant Game Over ved fejl!
// Med lyde, highscore og forvirrende navne!
// ============================================

var game = {
    active: false,
    currentCharacter: null,
    score: 0,
    questionsAnswered: 0,
    totalTimeLeft: 60,
    questionTimeLeft: 10,
    questionStartTime: 0,
    timer: null,
    questionTimer: null,
    usedCharacters: [],
    startTime: null,
    lives: 5,
    fastCorrectStreak: 0,
    chaosMode: false,
    pointMultiplier: 1,
    jumpscareTriggered: false,
    imageClickCount: 0, // Easter egg: 3 klik på billede = jumpscare
    comboStreak: 0 // Progressiv combo bonus (x1, x2, x3...)
};

var highscores = JSON.parse(localStorage.getItem('italianBrainrotHighscores')) || [];

// Audio context til tiktak lyd
var audioContext = null;
var tickInterval = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Audio system initialiseret');
    }
}

function playTick(frequency, duration) {
    if (!audioContext) return;
    
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function startTickTock() {
    stopTickTock(); // Stop eksisterende
    initAudio();
    
    var tick = true;
    
    function updateTick() {
        if (!game.active) {
            stopTickTock();
            return;
        }
        
        var timeLeft = game.totalTimeLeft;
        var urgency = 1 - (timeLeft / 60); // 0 til 1
        
        // Beregn interval baseret på tid tilbage
        var interval;
        if (timeLeft > 40) {
            interval = 1000; // Langsom (1 sekund)
        } else if (timeLeft > 20) {
            interval = 500; // Medium (0.5 sekund)
        } else if (timeLeft > 10) {
            interval = 250; // Hurtig (0.25 sekund)
        } else {
            interval = 100; // VANVITTIGT HURTIGT!
        }
        
        // Spil lyd
        var frequency = tick ? 800 : 600; // Alternerende tone
        var duration = 0.05;
        playTick(frequency, duration);
        
        tick = !tick;
        
        // Planlæg næste tick
        tickInterval = setTimeout(updateTick, interval);
    }
    
    updateTick();
}

function stopTickTock() {
    if (tickInterval) {
        clearTimeout(tickInterval);
        tickInterval = null;
    }
}

function triggerJumpscare(isChaosMode) {
    console.log('💀 JUMPSCARE TRIGGERED!' + (isChaosMode ? ' (KAOS MODE - EKSTRA VILDT!)' : ''));
    game.jumpscareTriggered = true;
    
    // Scroll til top så jumpscare er synlig
    window.scrollTo(0, 0);
    
    // Pause spillet
    var wasActive = game.active;
    game.active = false;
    clearInterval(game.timer);
    clearInterval(game.questionTimer);
    stopTickTock();
    
    // Opret jumpscare overlay
    var overlay = document.createElement('div');
    overlay.id = 'jumpscare-overlay';
    var flashSpeed = isChaosMode ? '0.05s' : '0.1s';
    var bgEffect = isChaosMode ? 'linear-gradient(45deg, #ff0000, #000000, #ff0000, #000000)' : 'black';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${bgEffect};
        background-size: 400% 400%;
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: jumpscareFlash ${flashSpeed} infinite, ${isChaosMode ? 'chaosGradient 0.3s infinite' : 'none'};
    `;
    
    var img = document.createElement('img');
    img.src = 'images/jumpscare.jpeg';
    var shakeSpeed = isChaosMode ? '0.03s' : '0.1s';
    var extraEffects = isChaosMode ? ', jumpscareRotate 0.2s infinite, jumpscareScale 0.15s infinite' : '';
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: ${isChaosMode ? 'hue-rotate(0deg) saturate(3) contrast(2)' : 'none'};
        animation: jumpscareShake ${shakeSpeed} infinite${extraEffects};
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    // Spil creepy skrig lyd (vildere i kaos mode)
    playScream(isChaosMode);
    
    // Fjern efter 2 sekunder
    setTimeout(function() {
        document.body.removeChild(overlay);
        
        // Genstart spillet hvis det var aktivt
        if (wasActive) {
            game.active = true;
            startTickTock();
            
            // Genstart timers
            game.timer = setInterval(function() {
                // Timer logik fortsætter...
                game.totalTimeLeft--;
                updateTotalTimer();
                
                if (game.totalTimeLeft <= 0) {
                    endGame(false);
                }
                
                // PROGRESSIV KAOS i kaos-mode!
                if (game.chaosMode && typeof window.increaseChaos === 'function') {
                    window.increaseChaos();
                }
            }, 1000);
        }
        
        console.log('💀 Jumpscare slut - spillet fortsætter!');
    }, 2000);
}

function playScream(isChaosMode) {
    if (!audioContext) {
        initAudio();
    }
    
    var duration = isChaosMode ? 2.5 : 2; // Længere i kaos mode
    var intensity = isChaosMode ? 1.5 : 1; // Højere intensitet i kaos mode
    var now = audioContext.currentTime;
    
    // LAYER 1: Dyb dæmonisk bas (mere i kaos mode)
    var bassCount = isChaosMode ? 4 : 2;
    for (var i = 0; i < bassCount; i++) {
        var bass = audioContext.createOscillator();
        var bassGain = audioContext.createGain();
        
        bass.connect(bassGain);
        bassGain.connect(audioContext.destination);
        
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(40 + i * 20, now);
        bass.frequency.exponentialRampToValueAtTime(20 + i * 10, now + duration);
        
        bassGain.gain.setValueAtTime(0.8 * intensity, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        bass.start(now);
        bass.stop(now + duration);
    }
    
    // LAYER 2: Højfrekvent skrig (mere i kaos mode)
    var screamCount = isChaosMode ? 8 : 5;
    for (var i = 0; i < screamCount; i++) {
        var scream = audioContext.createOscillator();
        var screamGain = audioContext.createGain();
        
        scream.connect(screamGain);
        screamGain.connect(audioContext.destination);
        
        scream.type = 'square';
        scream.frequency.setValueAtTime(800 + i * 400, now);
        scream.frequency.linearRampToValueAtTime(200 + i * 100, now + 0.5);
        scream.frequency.linearRampToValueAtTime(1200 + i * 300, now + 1);
        scream.frequency.exponentialRampToValueAtTime(100 + i * 50, now + duration);
        
        screamGain.gain.setValueAtTime(0.6 * intensity, now);
        screamGain.gain.linearRampToValueAtTime(0.8 * intensity, now + 0.3);
        screamGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        scream.start(now + i * 0.05);
        scream.stop(now + duration);
    }
    
    // LAYER 3: Kaotisk noise
    for (var i = 0; i < 3; i++) {
        var noise = audioContext.createOscillator();
        var noiseGain = audioContext.createGain();
        var filter = audioContext.createBiquadFilter();
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(Math.random() * 2000 + 500, now);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000 + i * 500, now);
        filter.Q.setValueAtTime(10, now);
        
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noise.start(now + Math.random() * 0.2);
        noise.stop(now + duration);
    }
    
    // LAYER 4: Pulserende sub-bass
    var subBass = audioContext.createOscillator();
    var subGain = audioContext.createGain();
    var lfo = audioContext.createOscillator();
    var lfoGain = audioContext.createGain();
    
    lfo.connect(lfoGain);
    lfoGain.connect(subGain.gain);
    
    subBass.connect(subGain);
    subGain.connect(audioContext.destination);
    
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(30, now);
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8, now); // 8 Hz pulsering
    lfoGain.gain.setValueAtTime(0.5, now);
    
    subGain.gain.setValueAtTime(0.7, now);
    
    lfo.start(now);
    lfo.stop(now + duration);
    subBass.start(now);
    subBass.stop(now + duration);
    
    // LAYER 5: Glitchy chaos
    for (var i = 0; i < 10; i++) {
        var glitch = audioContext.createOscillator();
        var glitchGain = audioContext.createGain();
        
        glitch.connect(glitchGain);
        glitchGain.connect(audioContext.destination);
        
        glitch.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
        glitch.frequency.setValueAtTime(Math.random() * 3000 + 200, now);
        
        var startTime = now + Math.random() * duration;
        var glitchDuration = 0.05 + Math.random() * 0.1;
        
        glitchGain.gain.setValueAtTime(0.3, startTime);
        glitchGain.gain.exponentialRampToValueAtTime(0.01, startTime + glitchDuration);
        
        glitch.start(startTime);
        glitch.stop(startTime + glitchDuration);
    }
    
    console.log('🔊🔊🔊 VANVITTIGT SKRIG MED 5 LAYERS!');
}

// Forvirrende italienske navne til text-to-speech
var confusingNames = [
    'TRALALERO TRALALA',
    'BOMBARDIRO CROCODILO',
    'CAPPUCCINO ASSASSINO',
    'BALLERINA CAPPUCCINA',
    'CHIMPANZINI BANANINI',
    'BOMBOMBINI GUSINI',
    'TUNG TUNG TUNG SAHUR'
];

function showGameModeSelection() {
    console.log('🎮 Viser mode selection...');
    // Vis mode selection dialog
    var modeDialog = document.getElementById('game-mode-selection');
    if (modeDialog) {
        modeDialog.style.display = 'flex';
        
        // Vis highscore liste i mode selection
        displayHighscoresInMode();
        
        console.log('✅ Mode selection vist!');
    } else {
        console.error('❌ game-mode-selection element ikke fundet!');
    }
}

function selectGameMode(mode) {
    console.log('🎮 Mode valgt:', mode);
    
    if (mode === 'chaos') {
        game.chaosMode = true;
        game.pointMultiplier = 1; // Samme point som kylling mode
        game.lives = 3; // Kun 3 liv i kaos mode!
        console.log('🔥 KAOS MODE AKTIVERET!');
        console.log('🔥 Kun 3 liv - ULTRA SVÆRT!');
        console.log('🔥 Byg din streak for bonus point!');
        console.log('🔥 Kaos vil øge progressivt under spillet!');
    } else {
        game.chaosMode = false;
        game.pointMultiplier = 1;
        game.lives = 5; // 5 liv i kylling mode
        console.log('🐔 KYLLING MODE');
        console.log('🐔 5 liv - mere tilgivende!');
        console.log('🐔 Byg din streak for bonus point!');
    }
    
    // Skjul mode selection
    document.getElementById('game-mode-selection').style.display = 'none';
    
    // Start spillet
    startGame();
}

function startGame() {
    game.active = true;
    game.score = 0;
    game.questionsAnswered = 0;
    game.usedCharacters = [];
    game.totalTimeLeft = 60;
    game.startTime = Date.now();
    // game.lives sættes nu i selectGameMode (3 for kaos, 5 for kylling)
    game.fastCorrectStreak = 0;
    game.jumpscareTriggered = false; // Reset jumpscare
    game.imageClickCount = 0; // Reset easter egg counter
    game.comboStreak = 0; // Reset combo
    
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('characters-grid').style.display = 'none';
    document.getElementById('game-start-btn').style.display = 'none';
    document.getElementById('game-end-btn').style.display = 'inline-block';
    document.getElementById('highscore-container').style.display = 'none';
    
    // Vis kaos-mode indikator og meter hvis aktiv
    var chaosIndicator = document.getElementById('chaos-mode-indicator');
    if (chaosIndicator) {
        chaosIndicator.style.display = game.chaosMode ? 'block' : 'none';
    }
    
    var chaosMeter = document.getElementById('chaos-meter');
    if (chaosMeter) {
        chaosMeter.style.display = game.chaosMode ? 'block' : 'none';
    }
    
    updateScore();
    updateLives();
    nextQuestion();
    
    // Start tiktak lyd
    startTickTock();
    
    // Start total timer
    game.timer = setInterval(function() {
        // Opdater visuel tiktak effekt
        var timerElement = document.getElementById('game-total-timer');
        if (timerElement) {
            var timeLeft = game.totalTimeLeft;
            
            // Skift farve baseret på tid
            if (timeLeft <= 10) {
                timerElement.style.color = '#ff0000';
                timerElement.style.animation = 'timerPanic 0.1s ease-in-out infinite';
            } else if (timeLeft <= 20) {
                timerElement.style.color = '#ff8800';
                timerElement.style.animation = 'timerWarning 0.25s ease-in-out infinite';
            } else if (timeLeft <= 40) {
                timerElement.style.color = '#ffff00';
                timerElement.style.animation = 'timerCaution 0.5s ease-in-out infinite';
            } else {
                timerElement.style.color = '#00ff00';
                timerElement.style.animation = 'glow 2s ease-in-out infinite';
            }
        }
        
        // PROGRESSIV KAOS i kaos-mode!
        if (game.chaosMode && typeof window.increaseChaos === 'function') {
            // Øg kaos hver sekund i kaos-mode
            window.increaseChaos();
        }
        game.totalTimeLeft--;
        updateTotalTimer();
        
        if (game.totalTimeLeft <= 0) {
            endGame(false); // Tid løbet ud
        }
    }, 1000);
    
    console.log('🎮 ULTRA SVÆRT SPIL STARTET!');
}

function endGame(wasWrong) {
    game.active = false;
    clearInterval(game.timer);
    clearInterval(game.questionTimer);
    stopTickTock(); // Stop tiktak lyd
    
    // Reset kaos til 0 og skjul meter
    if (typeof window.resetChaos === 'function') {
        window.resetChaos();
    }
    
    var chaosMeter = document.getElementById('chaos-meter');
    if (chaosMeter) {
        chaosMeter.style.display = 'none';
    }
    
    // Reset kaos mode
    game.chaosMode = false;
    game.pointMultiplier = 1;
    
    console.log('💫 Kaos stoppet - siden er rolig igen');
    console.log('💫 Kaos niveau: 0%');
    
    var finalScore = game.score;
    var questionsAnswered = game.questionsAnswered;
    
    document.getElementById('game-container').style.display = 'none';
    
    // Vis game over besked
    var t = translations[currentLanguage] || translations.en;
    var reason = wasWrong ? '❌ ' + t.wrong : '⏱️ ' + t.timeUp;
    
    // Tjek om det er en highscore
    if (highscores.length < 3 || finalScore > highscores[highscores.length - 1].score) {
        setTimeout(function() {
            showHighscoreEntry(finalScore, questionsAnswered, reason);
        }, 1500);
    } else {
        showHighscoreList();
        document.getElementById('characters-grid').style.display = 'grid';
        document.getElementById('game-start-btn').style.display = 'inline-block';
        document.getElementById('game-end-btn').style.display = 'none';
        
        setTimeout(function() {
            var t = translations[currentLanguage] || translations.en;
            alert('🎮 ' + t.gameOver + '\n\n' + reason + '\n\n' +
                  '🏆 ' + t.yourScore + ' ' + finalScore + ' ' + t.score.toLowerCase().replace(':', '') + '\n' +
                  '✅ ' + t.answered + ' ' + questionsAnswered + ' ' + t.questionsText + '\n\n' +
                  t.notGoodEnough);
        }, 100);
    }
    
    console.log('🎮 Game Over! Score:', finalScore, 'Reason:', reason);
}

function showHighscoreEntry(score, questions, reason) {
    var container = document.getElementById('highscore-entry');
    container.style.display = 'block';
    document.getElementById('final-score-display').textContent = score;
    document.getElementById('final-questions-display').textContent = questions;
    document.getElementById('game-over-reason').textContent = reason;
    
    // Focus på input
    document.getElementById('player-name-input').value = '';
    document.getElementById('player-name-input').focus();
}

function submitHighscore() {
    var playerName = document.getElementById('player-name-input').value.trim();
    
    if (!playerName) {
        alert('❌ Indtast dit navn!');
        return;
    }
    
    // Tilføj til highscore
    highscores.push({
        name: playerName,
        score: game.score,
        questions: game.questionsAnswered,
        date: new Date().toISOString()
    });
    
    // Sorter og behold kun top 3
    highscores.sort(function(a, b) { return b.score - a.score; });
    highscores = highscores.slice(0, 3);
    
    // Gem i localStorage
    localStorage.setItem('italianBrainrotHighscores', JSON.stringify(highscores));
    
    // Skjul entry, vis liste
    document.getElementById('highscore-entry').style.display = 'none';
    showHighscoreList();
    
    document.getElementById('characters-grid').style.display = 'grid';
    document.getElementById('game-start-btn').style.display = 'inline-block';
    document.getElementById('game-end-btn').style.display = 'none';
}

function displayHighscoresInMode() {
    var list = document.getElementById('mode-highscore-display');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (highscores.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Ingen highscores endnu! 🎮</div>';
    } else {
        for (var i = 0; i < highscores.length; i++) {
            var entry = highscores[i];
            var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            
            var div = document.createElement('div');
            div.className = 'highscore-entry';
            div.style.cssText = 'background:rgba(0,0,0,0.5); padding:15px; margin:10px 0; border-radius:10px; border:2px solid var(--neon-pink);';
            div.innerHTML = medal + ' <strong>' + entry.name + '</strong> - ' + 
                          entry.score + ' point (' + entry.questions + ' spørgsmål)';
            list.appendChild(div);
        }
    }
}

function showHighscoreList() {
    var container = document.getElementById('highscore-container');
    var list = document.getElementById('highscore-list');
    
    list.innerHTML = '';
    
    if (highscores.length === 0) {
        list.innerHTML = '<div class="no-scores">Ingen highscores endnu! 🎮</div>';
    } else {
        for (var i = 0; i < highscores.length; i++) {
            var entry = highscores[i];
            var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            
            var div = document.createElement('div');
            div.className = 'highscore-entry';
            div.innerHTML = medal + ' <strong>' + entry.name + '</strong> - ' + 
                          entry.score + ' point (' + entry.questions + ' spørgsmål)';
            list.appendChild(div);
        }
    }
    
    container.style.display = 'block';
}

function nextQuestion() {
    if (!game.active) return;
    
    // JUMPSCARE CHANCE
    if (!game.jumpscareTriggered) {
        var jumpscareChance = Math.random();
        var chanceThreshold = game.chaosMode ? 0.20 : 0.05; // 20% i kaos, 5% i kylling
        
        if (jumpscareChance < chanceThreshold) {
            console.log('💀 Jumpscare chance: ' + (chanceThreshold * 100) + '%');
            triggerJumpscare(game.chaosMode);
            return; // Stop og vent på jumpscare slutter
        }
    }
    
    // FØRSTE 3 RUNDER: Kun top karakterer (4-5 stjerner)
    var useTopOnly = game.questionsAnswered < 3;
    
    // Find en karakter der ikke er brugt endnu
    var availableChars = window.italianBrainrotCharacters.filter(function(char) {
        var notUsed = game.usedCharacters.indexOf(char.name) === -1;
        
        // Første 20 runder: kun 4-5 stjerner
        if (useTopOnly) {
            var starCount = (char.rarity.match(/⭐/g) || []).length;
            return notUsed && starCount >= 4;
        }
        
        return notUsed;
    });
    
    // Hvis alle er brugt, reset
    if (availableChars.length === 0) {
        game.usedCharacters = [];
        
        // Reset med samme filter
        if (useTopOnly) {
            availableChars = window.italianBrainrotCharacters.filter(function(char) {
                var starCount = (char.rarity.match(/⭐/g) || []).length;
                return starCount >= 4;
            });
        } else {
            availableChars = window.italianBrainrotCharacters;
        }
    }
    
    // Vælg tilfældig karakter
    var randomIndex = Math.floor(Math.random() * availableChars.length);
    game.currentCharacter = availableChars[randomIndex];
    game.usedCharacters.push(game.currentCharacter.name);
    
    // Gem start tid for hastigheds-bonus
    game.questionStartTime = Date.now();
    
    // Vis billede
    var imgElement = document.getElementById('game-character-image');
    imgElement.src = game.currentCharacter.image;
    imgElement.style.borderColor = game.currentCharacter.color;
    
    // Easter egg: 3 klik på billede = jumpscare!
    imgElement.onclick = function() {
        if (!game.chaosMode && !game.jumpscareTriggered) {
            game.imageClickCount++;
            console.log('🖱️ Billede klik: ' + game.imageClickCount + '/3');
            
            if (game.imageClickCount >= 3) {
                console.log('🥚 EASTER EGG AKTIVERET!');
                triggerJumpscare(game.chaosMode);
                game.imageClickCount = 0; // Reset
            }
        }
    };
    
    // Lyd afspilles EFTER svar, ikke før!
    
    // Generer svarmuligheder (1 korrekt + 3 forkerte)
    var options = [game.currentCharacter];
    
    // Brug samme pool som spørgsmålet (top karakterer i første 20 runder)
    var optionsPool = window.italianBrainrotCharacters;
    if (useTopOnly) {
        optionsPool = window.italianBrainrotCharacters.filter(function(char) {
            var starCount = (char.rarity.match(/⭐/g) || []).length;
            return starCount >= 4;
        });
    }
    
    while (options.length < 4) {
        var randomChar = optionsPool[
            Math.floor(Math.random() * optionsPool.length)
        ];
        
        var alreadyExists = false;
        for (var i = 0; i < options.length; i++) {
            if (options[i].name === randomChar.name) {
                alreadyExists = true;
                break;
            }
        }
        
        if (!alreadyExists) {
            options.push(randomChar);
        }
    }
    
    // Bland svarene
    options.sort(function() { return Math.random() - 0.5; });
    
    // Vis svarknapper
    var optionsContainer = document.getElementById('game-options');
    optionsContainer.innerHTML = '';
    
    for (var i = 0; i < options.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = options[i].name;
        btn.style.borderColor = options[i].color;
        btn.setAttribute('data-name', options[i].name);
        btn.onclick = function() {
            checkAnswer(this.getAttribute('data-name'));
        };
        optionsContainer.appendChild(btn);
    }
    
    // Start question timer (10 sekunder)
    game.questionTimeLeft = 10;
    updateQuestionTimer();
    clearInterval(game.questionTimer);
    game.questionTimer = setInterval(function() {
        game.questionTimeLeft--;
        updateQuestionTimer();
        
        if (game.questionTimeLeft <= 0) {
            clearInterval(game.questionTimer);
            wrongAnswer(); // Tid løbet ud = forkert = game over!
        }
    }, 1000);
}

function sayConfusingName() {
    // Sig det RIGTIGE navn!
    var correctName = game.currentCharacter.name;
    
    // Text-to-speech (virker i moderne browsere)
    if ('speechSynthesis' in window) {
        var utterance = new SpeechSynthesisUtterance(correctName);
        utterance.rate = 1.2; // Normal hastighed
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
    }
    
    console.log('🗣️ Siger (korrekt):', correctName);
}

function checkAnswer(selectedName) {
    clearInterval(game.questionTimer);
    
    if (selectedName === game.currentCharacter.name) {
        correctAnswer();
    } else {
        wrongAnswer();
    }
}

function correctAnswer() {
    // Sig det rigtige navn!
    sayConfusingName();
    
    // Øg combo streak!
    game.comboStreak++;
    
    // Beregn combo multiplier (x1, x2, x3...)
    var comboMultiplier = game.comboStreak;
    
    // Beregn hastigheds-bonus baseret på reaktionstid
    var reactionTime = Date.now() - game.questionStartTime;
    var timeBonus = Math.max(0, Math.floor((10000 - reactionTime) / 10)); // Max 1000 bonus
    var basePoints = 100;
    var totalPoints = (basePoints + timeBonus) * game.pointMultiplier * comboMultiplier; // Anvend multiplier OG combo!
    
    game.score += totalPoints;
    game.questionsAnswered++;
    
    // TID BONUS: +1 sekund ved korrekt svar!
    game.totalTimeLeft += 1;
    
    // Tjek om det var hurtigt nok (under 3 sekunder)
    var wasFast = reactionTime < 3000;
    
    if (wasFast) {
        game.fastCorrectStreak++;
    } else {
        game.fastCorrectStreak = 0;
    }
    
    // Bonus liv hver 3. hurtige korrekte svar!
    var bonusLife = false;
    if (game.fastCorrectStreak >= 3) {
        game.lives++;
        game.fastCorrectStreak = 0;
        bonusLife = true;
    }
    
    // Vis feedback med bonus
    var feedback = document.getElementById('game-feedback');
    var displayPoints = basePoints * game.pointMultiplier * comboMultiplier;
    var displayBonus = timeBonus * game.pointMultiplier * comboMultiplier;
    
    var feedbackHTML = '✅ KORREKT!<br>' +
                        '<span style="font-size:1.8rem; color:#00ff88;">🎯 ' + game.currentCharacter.name + '</span><br>' +
                        '<span style="font-size:2rem;">+' + displayPoints + ' point</span><br>' +
                        '<span style="font-size:1.5rem; color:#ffd700;">⚡ HASTIGHEDS BONUS: +' + displayBonus + '</span><br>' +
                        '<span style="font-size:1.3rem; color:#00ff00;">⏱️ +1 SEKUND!</span>';
    
    // Vis combo multiplier
    if (game.comboStreak > 1) {
        feedbackHTML += '<br><span style="font-size:2rem; color:#ff8c00;">🔥 STREAK x' + game.comboStreak + '!</span>';
    }
    
    if (wasFast) {
        feedbackHTML += '<br><span style="font-size:1.3rem; color:#00ffff;">🔥 HURTIG! (' + game.fastCorrectStreak + '/3)</span>';
    }
    
    if (bonusLife) {
        feedbackHTML += '<br><span style="font-size:2rem; color:#00ff00;">❤️ +1 LIV!</span>';
    }
    
    feedback.innerHTML = feedbackHTML;
    feedback.style.color = '#00ff00';
    feedback.style.display = 'block';
    
    // Afspil success lyd
    playSound('success');
    
    updateScore();
    updateLives();
    updateCombo();
    
    setTimeout(function() {
        feedback.style.display = 'none';
        if (game.active) {
            nextQuestion();
        }
    }, 1000);
    
    console.log('✅ Korrekt! Reaktionstid:', reactionTime + 'ms', 'Bonus:', timeBonus, 'Hurtig:', wasFast, 'Streak:', game.fastCorrectStreak);
}

function wrongAnswer() {
    // Sig det rigtige navn!
    sayConfusingName();
    
    // Mist et liv!
    game.lives--;
    game.fastCorrectStreak = 0; // Reset streak
    game.comboStreak = 0; // Reset combo!
    
    // Vis feedback
    var feedback = document.getElementById('game-feedback');
    
    if (game.lives > 0) {
        // TID STRAF: -10 sekunder ved fejl!
        game.totalTimeLeft = Math.max(0, game.totalTimeLeft - 10);
        
        // Stadig liv tilbage!
        var t = translations[currentLanguage] || translations.en;
        feedback.innerHTML = '❌ ' + t.wrong + '<br>' +
                            '<span style="font-size:1.5rem;">' + t.itWas + ' ' + game.currentCharacter.name + '</span><br>' +
                            '<span style="font-size:2rem; color:#ff0000;">' + t.minusOneLive + ' (' + game.lives + ' ' + t.livesLeft + ')</span><br>' +
                            '<span style="font-size:1.5rem; color:#ff6600;">⏱️ ' + t.minusTenSeconds + '</span>';
        feedback.style.color = '#ff0000';
        feedback.style.display = 'block';
        
        // Afspil fejl lyd
        playBrainrotFailSound();
        
        updateLives();
        updateCombo();
        
        setTimeout(function() {
            feedback.style.display = 'none';
            if (game.active) {
                nextQuestion();
            }
        }, 1500);
        
        console.log('❌ Forkert! Liv tilbage:', game.lives);
    } else {
        // GAME OVER - ingen liv tilbage!
        game.active = false;
        clearInterval(game.timer);
        clearInterval(game.questionTimer);
        
        var t = translations[currentLanguage] || translations.en;
        feedback.innerHTML = '💀 ' + t.gameOver + ' 💀<br>' +
                            '<span style="font-size:1.5rem;">' + t.itWas + ' ' + game.currentCharacter.name + '</span><br>' +
                            '<span style="font-size:2rem; color:#ff0000;">' + t.noLivesLeft + '</span>';
        feedback.style.color = '#ff0000';
        feedback.style.display = 'block';
        
        // Afspil EPISK BRAINROT FEJL LYD!
        playBrainrotFailSound();
        
        updateScore();
        updateLives();
        
        // End game efter 2 sekunder
        setTimeout(function() {
            feedback.style.display = 'none';
            endGame(true); // true = forkert svar
        }, 2000);
        
        console.log('💀 GAME OVER! Ingen liv tilbage!');
    }
}

function playSound(type) {
    // Simpel beep lyd for success
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

function playBrainrotFailSound() {
    // EPISK BRAINROT FEJL LYD - Dramatisk nedadgående tone!
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start høj, gå ned (dramatisk fail)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Tilføj vibrering hvis understøttet
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    console.log('💥 BRAINROT FAIL LYD!');
}

function updateScore() {
    document.getElementById('game-score').textContent = game.score;
    document.getElementById('game-questions').textContent = game.questionsAnswered;
}

function updateLives() {
    var livesElement = document.getElementById('game-lives');
    var livesHTML = '';
    
    for (var i = 0; i < game.lives; i++) {
        livesHTML += '❤️';
    }
    
    // Vis tomme hjerter for mistede liv
    var startLives = game.chaosMode ? 3 : 5; // 3 i kaos, 5 i kylling
    var maxLives = Math.max(startLives, game.lives); // Vis mindst start liv, men flere hvis bonus
    for (var j = game.lives; j < startLives; j++) {
        livesHTML += '🖤';
    }
    
    livesElement.innerHTML = livesHTML;
    
    // Tilføj pulsering hvis kun 1 liv tilbage
    if (game.lives === 1) {
        livesElement.style.animation = 'pulse 0.5s infinite';
    } else {
        livesElement.style.animation = 'none';
    }
}

function updateCombo() {
    var comboElement = document.getElementById('game-combo');
    var comboStat = document.getElementById('combo-stat');
    
    if (game.comboStreak > 1) {
        comboElement.textContent = 'x' + game.comboStreak;
        comboStat.style.display = 'block';
        
        // Farve baseret på combo level
        if (game.comboStreak >= 10) {
            comboElement.style.color = '#ff00ff'; // Lilla for mega combo
        } else if (game.comboStreak >= 5) {
            comboElement.style.color = '#ff8c00'; // Orange for stor combo
        } else {
            comboElement.style.color = '#ffd700'; // Guld for normal combo
        }
    } else {
        comboStat.style.display = 'none';
    }
}

function updateTotalTimer() {
    var timerElement = document.getElementById('game-total-timer');
    timerElement.textContent = game.totalTimeLeft;
    
    if (game.totalTimeLeft <= 3) {
        timerElement.style.color = '#ff0000';
        timerElement.style.animation = 'pulse 0.5s infinite';
    } else {
        timerElement.style.color = '#00ff00';
        timerElement.style.animation = 'none';
    }
}

function updateQuestionTimer() {
    var timerElement = document.getElementById('game-question-timer');
    timerElement.textContent = game.questionTimeLeft;
    
    if (game.questionTimeLeft <= 1) {
        timerElement.style.color = '#ff0000';
        timerElement.style.animation = 'pulse 0.3s infinite';
    } else {
        timerElement.style.color = '#ffff00';
        timerElement.style.animation = 'none';
    }
}

// Vis highscore ved page load
window.addEventListener('load', function() {
    if (highscores.length > 0) {
        showHighscoreList();
    }
});

console.log('🎮 Ultra Svært Spil System Indlæst!');
console.log('⚡ Hastigheds-bonus aktiveret!');
console.log('💀 Instant Game Over ved fejl!');
