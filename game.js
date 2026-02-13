// ============================================
// ITALIAN BRAINROT - OPTIMIZED GAME ENGINE
// Performance-focused, clean code, epic gameplay!
// ============================================

'use strict';

// ===== GAME STATE (Single source of truth) =====
const GameState = {
    active: false,
    currentCharacter: null,
    score: 0,
    questionsAnswered: 0,
    totalTimeLeft: 60,
    questionTimeLeft: 10,
    questionStartTime: 0,
    lives: 5,
    maxLives: 5,
    comboStreak: 0,
    chaosMode: false,
    jumpscareTriggered: false,
    imageClickCount: 0,
    usedCharacters: [],
    chaosShuffleInterval: null,
    chaosLevel: 0,
    timers: {
        main: null,
        question: null,
        tick: null
    }
};

// ===== CACHED DOM ELEMENTS =====
const DOM = {
    cache: new Map(),
    
    get(id) {
        if (!this.cache.has(id)) {
            const el = document.getElementById(id);
            if (el) this.cache.set(id, el);
            return el;
        }
        return this.cache.get(id);
    },
    
    clearCache() {
        this.cache.clear();
    }
};

// ===== AUDIO SYSTEM (Optimized) =====
const AudioSystem = {
    context: null,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 Audio system ready');
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    },
    
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const now = this.context.currentTime;
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    },
    
    playCorrect() {
        this.playTone(523, 0.1, 'sine', 0.4); // C5
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.4), 100); // E5
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.4), 200); // G5
    },
    
    playWrong() {
        this.playTone(200, 0.3, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.3), 150);
    },
    
    playTick(urgent = false) {
        const freq = urgent ? 1000 : 800;
        this.playTone(freq, 0.05, 'sine', urgent ? 0.4 : 0.2);
    },
    
    playScream(intense = false) {
        if (!this.context) return;
        
        const now = this.context.currentTime;
        const duration = intense ? 3.0 : 2.5;
        const layers = intense ? 8 : 5;
        const volume = intense ? 0.9 : 0.7; // LOUDER!
        
        // DEEP BASS RUMBLE - feels like doom
        for (let i = 0; i < layers; i++) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(30 + i * 10, now);
            osc.frequency.exponentialRampToValueAtTime(15, now + duration);
            
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.start(now + i * 0.01);
            osc.stop(now + duration);
        }
        
        // HIGH PITCHED SCREAM - piercing!
        for (let i = 0; i < layers; i++) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(800 + i * 400, now);
            osc.frequency.linearRampToValueAtTime(2000 + i * 300, now + 0.3);
            osc.frequency.exponentialRampToValueAtTime(80, now + duration);
            
            gain.gain.setValueAtTime(volume * 0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.start(now + i * 0.03);
            osc.stop(now + duration);
        }
        
        // DISTORTED NOISE LAYER - chaos!
        if (intense) {
            for (let i = 0; i < 4; i++) {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                const distortion = this.context.createWaveShaper();
                
                // Create distortion curve
                const curve = new Float32Array(256);
                for (let j = 0; j < 256; j++) {
                    const x = (j / 128) - 1;
                    curve[j] = Math.tanh(x * 10);
                }
                distortion.curve = curve;
                
                osc.connect(distortion);
                distortion.connect(gain);
                gain.connect(this.context.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100 + Math.random() * 500, now);
                osc.frequency.linearRampToValueAtTime(50 + Math.random() * 200, now + duration);
                
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                osc.start(now + i * 0.1);
                osc.stop(now + duration);
            }
        }
        
        // SUDDEN LOUD BURST at start
        const burst = this.context.createOscillator();
        const burstGain = this.context.createGain();
        burst.connect(burstGain);
        burstGain.connect(this.context.destination);
        burst.type = 'square';
        burst.frequency.setValueAtTime(1500, now);
        burst.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        burstGain.gain.setValueAtTime(intense ? 1.0 : 0.8, now);
        burstGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        burst.start(now);
        burst.stop(now + 0.3);
    },
    
    speakName(name) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel(); // Stop any ongoing speech
            
            const utterance = new SpeechSynthesisUtterance(name);
            utterance.rate = 0.9;   // Slower = clearer
            utterance.pitch = 1.1;  // Slightly higher = more fun
            utterance.volume = 1.0; // Full volume
            
            // Try Italian voice for authentic brainrot feel!
            const voices = speechSynthesis.getVoices();
            const italianVoice = voices.find(v => v.lang.includes('it'));
            if (italianVoice) {
                utterance.voice = italianVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }
};

// ===== TICK SYSTEM (Optimized) =====
const TickSystem = {
    running: false,
    lastTick: 0,
    
    start() {
        if (this.running) return;
        this.running = true;
        this.tick();
    },
    
    stop() {
        this.running = false;
        if (GameState.timers.tick) {
            cancelAnimationFrame(GameState.timers.tick);
            GameState.timers.tick = null;
        }
    },
    
    tick() {
        if (!this.running || !GameState.active) return;
        
        const now = performance.now();
        const timeLeft = GameState.totalTimeLeft;
        
        // Calculate interval based on urgency
        let interval;
        if (timeLeft > 40) interval = 1000;
        else if (timeLeft > 20) interval = 500;
        else if (timeLeft > 10) interval = 250;
        else interval = 100;
        
        if (now - this.lastTick >= interval) {
            AudioSystem.playTick(timeLeft <= 10);
            this.lastTick = now;
        }
        
        GameState.timers.tick = requestAnimationFrame(() => this.tick());
    }
};

// ===== HIGHSCORE SYSTEM =====
const HighscoreSystem = {
    key: 'italianBrainrotHighscores',
    maxEntries: 10,
    currentView: 'local', // 'local' or 'global'
    globalScoresCache: [],
    
    // LOCAL STORAGE
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch {
            return [];
        }
    },
    
    save(name, score, mode) {
        const scores = this.get();
        scores.push({ name, score, mode, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(this.maxEntries);
        localStorage.setItem(this.key, JSON.stringify(scores));
        
        // Also save to global if Firebase is available
        this.saveGlobal(name, score, mode);
        
        return scores;
    },
    
    // GLOBAL FIREBASE
    async saveGlobal(name, score, mode) {
        if (!window.FirebaseConfig || !window.FirebaseConfig.isAvailable()) {
            return false;
        }
        
        try {
            const db = window.FirebaseConfig.getDatabase();
            const scoresRef = db.ref('highscores');
            
            await scoresRef.push({
                name: name,
                score: score,
                mode: mode,
                date: Date.now(),
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            
            console.log('✅ Score saved to global leaderboard');
            return true;
        } catch (error) {
            console.warn('⚠️ Failed to save global score:', error.message);
            return false;
        }
    },
    
    async getGlobal(limit = 50) {
        if (!window.FirebaseConfig || !window.FirebaseConfig.isAvailable()) {
            return [];
        }
        
        try {
            const db = window.FirebaseConfig.getDatabase();
            const scoresRef = db.ref('highscores').orderByChild('score').limitToLast(limit);
            
            const snapshot = await scoresRef.once('value');
            const scores = [];
            
            snapshot.forEach((child) => {
                scores.push(child.val());
            });
            
            // Sort by score descending
            scores.sort((a, b) => b.score - a.score);
            this.globalScoresCache = scores;
            
            return scores;
        } catch (error) {
            console.warn('⚠️ Failed to load global scores:', error.message);
            return [];
        }
    },
    
    isHighscore(score) {
        const scores = this.get();
        return scores.length < 3 || score > (scores[2]?.score || 0);
    },
    
    async render(containerId) {
        const container = DOM.get(containerId);
        if (!container) return;
        
        const t = translations[currentLanguage] || translations.en;
        const hasFirebase = window.FirebaseConfig && window.FirebaseConfig.isAvailable();
        
        // Create tabs HTML
        const tabsHTML = `
            <div class="highscore-tabs">
                <button class="highscore-tab ${this.currentView === 'local' ? 'active' : ''}" onclick="HighscoreSystem.switchView('local')">
                    📱 ${t.localHighscores || 'Local'}
                </button>
                ${hasFirebase ? `
                    <button class="highscore-tab ${this.currentView === 'global' ? 'active' : ''}" onclick="HighscoreSystem.switchView('global')">
                        🌍 ${t.globalHighscores || 'Global'}
                    </button>
                ` : ''}
            </div>
            <div id="highscore-content" class="highscore-content"></div>
        `;
        
        container.innerHTML = tabsHTML;
        
        // Render current view
        await this.renderView();
    },
    
    async renderView() {
        const contentDiv = DOM.get('highscore-content');
        if (!contentDiv) return;
        
        const t = translations[currentLanguage] || translations.en;
        
        if (this.currentView === 'local') {
            this.renderLocal(contentDiv, t);
        } else {
            await this.renderGlobal(contentDiv, t);
        }
    },
    
    renderLocal(container, t) {
        const scores = this.get();
        
        if (scores.length === 0) {
            container.innerHTML = `<div class="no-scores">${t.noHighscores || 'No highscores yet!'} 🎮</div>`;
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        container.innerHTML = scores.slice(0, 10).map((s, i) => `
            <div class="highscore-item">
                <span class="highscore-rank">${medals[i] || (i + 1) + '.'}</span>
                <span class="highscore-name">${s.name}</span>
                <span class="highscore-score">${s.score}</span>
            </div>
        `).join('');
    },
    
    async renderGlobal(container, t) {
        container.innerHTML = `<div class="loading-scores">⏳ ${t.loadingScores || 'Loading...'}</div>`;
        
        console.log('🔍 Fetching global scores...');
        const scores = await this.getGlobal(50);
        console.log('📊 Got scores:', scores.length, scores);
        
        if (scores.length === 0) {
            container.innerHTML = `<div class="no-scores">${t.noGlobalScores || 'No global scores yet!'} 🌍</div>`;
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        container.innerHTML = scores.slice(0, 50).map((s, i) => `
            <div class="highscore-item ${i < 3 ? 'top-three' : ''}">
                <span class="highscore-rank">${medals[i] || (i + 1) + '.'}</span>
                <span class="highscore-name">${s.name}</span>
                <span class="highscore-score">${s.score}</span>
            </div>
        `).join('');
    },
    
    async switchView(view) {
        this.currentView = view;
        
        // Update tab active states
        document.querySelectorAll('.highscore-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.highscore-tab:nth-child(${view === 'local' ? 1 : 2})`);
        if (activeTab) activeTab.classList.add('active');
        
        // Render new view
        await this.renderView();
    }
};

// ===== GAME CONTROLLER =====
const Game = {
    characters: [],
    
    init() {
        AudioSystem.init();
        this.characters = window.italianBrainrotCharacters || [];
        this.bindEvents();
        console.log('🎮 Game initialized with', this.characters.length, 'characters');
    },
    
    bindEvents() {
        // Image click easter egg
        const gameImage = DOM.get('game-character-image');
        if (gameImage) {
            gameImage.addEventListener('click', () => {
                if (!GameState.chaosMode) return;
                GameState.imageClickCount++;
                if (GameState.imageClickCount >= 3) {
                    GameState.imageClickCount = 0;
                    this.triggerJumpscare();
                }
            });
        }
    },
    
    showModeSelection() {
        const dialog = DOM.get('game-mode-selection');
        if (dialog) {
            dialog.style.display = 'flex';
            HighscoreSystem.render('mode-highscore-list');
            WhoIsItHighscore.render('whoisit-highscore-menu');
            MemoryHighscore.render('memory-highscore-menu');
            MemoryHCHighscore.renderScores('memoryhc-highscore-menu');
            if (typeof SpeedRememberGame !== 'undefined') {
                SpeedRememberGame.renderHighscores('speedremember-highscore-menu');
            }
            if (typeof CrushHighscore !== 'undefined') {
                CrushHighscore.renderMini('crush-highscore-menu');
            }
            if (typeof FlappyHighscore !== 'undefined') {
                FlappyHighscore.renderMini('flappy-highscore-menu');
            }
        }
    },
    
    selectMode(mode) {
        GameState.chaosMode = mode === 'chaos';
        GameState.maxLives = GameState.chaosMode ? 3 : 5;
        
        const dialog = DOM.get('game-mode-selection');
        if (dialog) dialog.style.display = 'none';
        
        // Show/hide chaos elements
        const chaosIndicator = DOM.get('chaos-mode-indicator');
        const chaosMeter = DOM.get('chaos-meter');
        
        if (chaosIndicator) chaosIndicator.style.display = GameState.chaosMode ? 'block' : 'none';
        if (chaosMeter) chaosMeter.style.display = GameState.chaosMode ? 'block' : 'none';
        
        if (GameState.chaosMode && typeof window.resetChaos === 'function') {
            window.resetChaos();
        }
        
        this.start();
    },
    
    start() {
        // Stop any existing chaos shuffle
        this.stopChaosShuffle();
        this.clearTimers();
        
        // Reset state completely
        Object.assign(GameState, {
            active: true,
            score: 0,
            questionsAnswered: 0,
            totalTimeLeft: 60,
            lives: GameState.maxLives,
            comboStreak: 0,
            jumpscareTriggered: false,
            imageClickCount: 0,
            usedCharacters: [],
            chaosLevel: 0,
            chaosShuffleInterval: null
        });
        
        // Hide any open dialogs first
        const highscoreEntry = DOM.get('highscore-entry');
        if (highscoreEntry) highscoreEntry.style.display = 'none';
        
        const modeSelection = DOM.get('game-mode-selection');
        if (modeSelection) modeSelection.style.display = 'none';
        
        // Show game overlay (contains game-container)
        const overlay = DOM.get('game-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        // Hide Play Quiz button during game
        const playButton = document.querySelector('.play-quiz-btn');
        if (playButton) playButton.style.display = 'none';
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        
        // Update UI
        this.updateUI();
        
        // Start timers
        this.startTimers();
        TickSystem.start();
        
        // First question
        this.nextQuestion();
        
        console.log('🎮 Game started!', GameState.chaosMode ? '(CHAOS MODE)' : '(Normal)');
    },
    
    startTimers() {
        this.clearTimers();
        
        GameState.timers.main = setInterval(() => {
            if (!GameState.active) return;
            
            GameState.totalTimeLeft--;
            this.updateTimer();
            
            if (GameState.totalTimeLeft <= 0) {
                this.end('time');
            }
            
            // Chaos mode effects
            if (GameState.chaosMode && typeof window.increaseChaos === 'function') {
                window.increaseChaos();
            }
        }, 1000);
    },
    
    clearTimers() {
        if (GameState.timers.main) clearInterval(GameState.timers.main);
        if (GameState.timers.question) clearInterval(GameState.timers.question);
        TickSystem.stop();
    },
    
    nextQuestion() {
        if (!GameState.active) return;
        
        // Check for jumpscare
        // Jumpscare chance - halveret for bedre gameplay
        const jumpscareChance = GameState.chaosMode ? 0.10 : 0.025;
        if (!GameState.jumpscareTriggered && Math.random() < jumpscareChance) {
            this.triggerJumpscare();
            return;
        }
        
        // Get available characters
        let available = this.characters.filter(c => !GameState.usedCharacters.includes(c.name));
        
        // Reset if needed or after 3 questions
        if (available.length < 4 || GameState.questionsAnswered >= 3) {
            GameState.usedCharacters = [];
            available = [...this.characters];
        }
        
        // Select random character
        const randomIndex = Math.floor(Math.random() * available.length);
        GameState.currentCharacter = available[randomIndex];
        GameState.usedCharacters.push(GameState.currentCharacter.name);
        GameState.questionStartTime = Date.now();
        GameState.imageClickCount = 0;
        
        // Update image
        const img = DOM.get('game-character-image');
        if (img) {
            img.src = GameState.currentCharacter.image;
            img.style.borderColor = GameState.currentCharacter.color || '#ff10f0';
        }
        
        // Generate options
        this.generateOptions();
    },
    
    generateOptions() {
        const correct = GameState.currentCharacter.name;
        const allNames = this.characters.map(c => c.name).filter(n => n !== correct);
        
        // Shuffle and pick 3 wrong answers
        const shuffled = allNames.sort(() => Math.random() - 0.5);
        const options = [correct, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);
        
        // Render options
        const container = DOM.get('game-options');
        if (container) {
            container.innerHTML = options.map(name => `
                <button class="game-option" onclick="Game.checkAnswer('${name.replace(/'/g, "\\'")}')">
                    ${name}
                </button>
            `).join('');
            
            // Start chaos shuffle in chaos mode
            if (GameState.chaosMode) {
                this.startChaosShuffle();
            }
        }
    },
    
    // Chaos shuffle - buttons randomly swap positions faster and faster!
    startChaosShuffle() {
        this.stopChaosShuffle();
        
        // Calculate shuffle speed based on chaos level (faster as chaos increases)
        const baseInterval = 2000; // Start at 2 seconds
        const minInterval = 300;   // Minimum 300ms
        const chaosMultiplier = 1 - (GameState.chaosLevel / 150); // Gets faster as chaos increases
        const interval = Math.max(minInterval, baseInterval * chaosMultiplier);
        
        GameState.chaosShuffleInterval = setInterval(() => {
            if (!GameState.active || !GameState.chaosMode) {
                this.stopChaosShuffle();
                return;
            }
            this.shuffleButtons();
        }, interval);
    },
    
    stopChaosShuffle() {
        if (GameState.chaosShuffleInterval) {
            clearInterval(GameState.chaosShuffleInterval);
            GameState.chaosShuffleInterval = null;
        }
    },
    
    shuffleButtons() {
        const container = DOM.get('game-options');
        if (!container) return;
        
        const buttons = Array.from(container.querySelectorAll('.game-option'));
        if (buttons.length < 2) return;
        
        // Shuffle button positions with animation
        for (let i = buttons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== j) {
                // Add shuffle animation class
                buttons[i].classList.add('shuffling');
                buttons[j].classList.add('shuffling');
                
                // Swap in DOM
                const parent = buttons[i].parentNode;
                const sibling = buttons[i].nextSibling === buttons[j] ? buttons[i] : buttons[j].nextSibling;
                parent.insertBefore(buttons[j], buttons[i]);
                parent.insertBefore(buttons[i], sibling);
                
                // Remove animation class after animation
                setTimeout(() => {
                    buttons[i].classList.remove('shuffling');
                    buttons[j].classList.remove('shuffling');
                }, 300);
            }
        }
    },
    
    checkAnswer(answer) {
        if (!GameState.active) return;
        
        const correct = answer === GameState.currentCharacter.name;
        const reactionTime = Date.now() - GameState.questionStartTime;
        
        if (correct) {
            this.handleCorrect(reactionTime);
        } else {
            this.handleWrong();
        }
    },
    
    handleCorrect(reactionTime) {
        GameState.comboStreak++;
        GameState.questionsAnswered++;
        
        // Calculate points
        const timeBonus = Math.max(0, Math.floor((10000 - reactionTime) / 10));
        const basePoints = 100;
        const totalPoints = basePoints + timeBonus;
        
        GameState.score += totalPoints;
        GameState.totalTimeLeft = Math.min(120, GameState.totalTimeLeft + 1);
        
        // Increase chaos level in chaos mode (makes buttons shuffle faster!)
        if (GameState.chaosMode) {
            GameState.chaosLevel = Math.min(100, GameState.chaosLevel + 5);
            this.startChaosShuffle(); // Restart with new speed
        }
        
        // Audio & visual feedback
        AudioSystem.playCorrect();
        AudioSystem.speakName(GameState.currentCharacter.name);
        
        this.showFeedback(true, totalPoints);
        this.updateUI();
        
        setTimeout(() => {
            this.hideFeedback();
            this.nextQuestion();
        }, 1000);
    },
    
    handleWrong() {
        GameState.lives--;
        GameState.comboStreak = 0;
        GameState.totalTimeLeft = Math.max(0, GameState.totalTimeLeft - 10);
        
        AudioSystem.playWrong();
        AudioSystem.speakName(GameState.currentCharacter.name);
        
        if (GameState.lives <= 0) {
            this.showFeedback(false, 0, true);
            setTimeout(() => this.end('lives'), 1500);
        } else {
            this.showFeedback(false);
            this.updateUI();
            setTimeout(() => {
                this.hideFeedback();
                this.nextQuestion();
            }, 1500);
        }
    },
    
    showFeedback(correct, points = 0, gameOver = false) {
        const feedback = DOM.get('game-feedback');
        if (!feedback) return;
        
        const t = translations[currentLanguage] || translations.en;
        const name = GameState.currentCharacter.name;
        
        if (gameOver) {
            feedback.innerHTML = `
                💀 ${t.gameOver || 'GAME OVER!'} 💀<br>
                <span style="font-size:1.5rem;">${t.itWas || 'It was'} ${name}</span><br>
                <span style="font-size:2rem; color:#ff0000;">${t.noLivesLeft || 'NO LIVES LEFT!'}</span>
            `;
            feedback.style.color = '#ff0000';
        } else if (correct) {
            feedback.innerHTML = `
                ✅ ${t.correct || 'CORRECT!'}<br>
                <span style="font-size:1.5rem;">+${points} ${t.score?.replace(':', '') || 'points'}</span>
                ${GameState.comboStreak > 1 ? `<br><span style="color:#ff6600;">🔥 ${GameState.comboStreak}x STREAK!</span>` : ''}
            `;
            feedback.style.color = '#00ff00';
        } else {
            feedback.innerHTML = `
                ❌ ${t.wrong || 'WRONG!'}<br>
                <span style="font-size:1.5rem;">${t.itWas || 'It was'} ${name}</span><br>
                <span style="font-size:2rem; color:#ff0000;">${t.minusOneLive || '-1 LIFE!'} (${GameState.lives} ${t.livesLeft || 'left'})</span><br>
                <span style="font-size:1.5rem; color:#ff6600;">⏱️ ${t.minusTenSeconds || '-10 SECONDS!'}</span>
            `;
            feedback.style.color = '#ff0000';
        }
        
        feedback.style.display = 'block';
    },
    
    hideFeedback() {
        const feedback = DOM.get('game-feedback');
        if (feedback) feedback.style.display = 'none';
    },
    
    updateUI() {
        // Score
        const scoreEl = DOM.get('game-score');
        if (scoreEl) scoreEl.textContent = GameState.score;
        
        // Questions
        const questionsEl = DOM.get('game-questions');
        if (questionsEl) questionsEl.textContent = GameState.questionsAnswered;
        
        // Lives
        const livesEl = DOM.get('game-lives');
        if (livesEl) {
            const hearts = '❤️'.repeat(GameState.lives) + '🖤'.repeat(GameState.maxLives - GameState.lives);
            livesEl.textContent = hearts;
        }
        
        // Streak
        const streakEl = DOM.get('game-streak');
        if (streakEl) {
            streakEl.textContent = GameState.comboStreak > 0 ? `🔥 ${GameState.comboStreak}` : '-';
        }
        
        // Combo display
        const comboEl = DOM.get('combo-display');
        if (comboEl) {
            comboEl.style.display = GameState.comboStreak > 1 ? 'block' : 'none';
            comboEl.textContent = `🔥 ${GameState.comboStreak}x STREAK!`;
        }
    },
    
    updateTimer() {
        const timerEl = DOM.get('game-time');
        if (timerEl) timerEl.textContent = GameState.totalTimeLeft + 's';
        
        const timerBar = DOM.get('timer-bar');
        if (timerBar) {
            const percent = (GameState.totalTimeLeft / 60) * 100;
            timerBar.style.width = Math.min(100, percent) + '%';
        }
    },
    
    end(reason) {
        GameState.active = false;
        this.clearTimers();
        this.stopChaosShuffle();
        GameState.chaosLevel = 0;
        
        if (GameState.chaosMode && typeof window.resetChaos === 'function') {
            window.resetChaos();
        }
        
        const t = translations[currentLanguage] || translations.en;
        const isHighscore = HighscoreSystem.isHighscore(GameState.score);
        
        // Hide game overlay
        const overlay = DOM.get('game-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Show Play Quiz button again
        const playButton = document.querySelector('.play-quiz-btn');
        if (playButton) playButton.style.display = 'flex';
        
        // Unlock body scroll
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        
        // Always show highscore entry so scores get saved to Firebase
        const entry = DOM.get('highscore-entry');
        if (entry) {
            entry.style.display = 'flex';
            const scoreDisplay = DOM.get('final-score-display');
            if (scoreDisplay) scoreDisplay.textContent = GameState.score;
            
            // Show if it's a top 3 score or not
            const topScoreMsg = entry.querySelector('.top-score-msg');
            if (topScoreMsg) {
                topScoreMsg.textContent = isHighscore ? '🏆 NY HIGHSCORE!' : '📊 Gem din score!';
            }
        }
        
        if (false) { // Disabled - always show entry now
            // Show game over dialog (not alert)
            const reasonText = reason === 'time' ? (t.timeUp || 'TIME UP!') : (t.noLivesLeft || 'NO LIVES LEFT!');
            
            // Create game over overlay
            const gameOverOverlay = document.createElement('div');
            gameOverOverlay.id = 'game-over-overlay';
            gameOverOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            `;
            
            gameOverOverlay.innerHTML = `
                <div style="
                    background: linear-gradient(145deg, #1a0033, #330066);
                    border: 4px solid #ff10f0;
                    border-radius: 25px;
                    padding: 30px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 0 50px rgba(255, 16, 240, 0.5);
                    position: relative;
                ">
                    <!-- X Close button -->
                    <button onclick="Game.closeGameOver()" ontouchend="Game.closeGameOver(); event.preventDefault();" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid #ff10f0;
                        border-radius: 50%;
                        width: 35px;
                        height: 35px;
                        font-size: 1.2rem;
                        color: #ff10f0;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#ff10f0'; this.style.color='white';" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#ff10f0';">✕</button>
                    <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: #ff0000; margin-bottom: 15px;">
                        🎮 ${t.gameOver || 'GAME OVER!'}
                    </h2>
                    <p style="font-size: 1.5rem; color: #ff6666; margin-bottom: 20px;">${reasonText}</p>
                    <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                        <p style="font-size: 1.2rem; color: #00ffff;">🏆 ${t.yourScore || 'Your Score:'}</p>
                        <p style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ffff00;">${GameState.score}</p>
                        <p style="font-size: 1rem; color: #aaa;">✅ ${GameState.questionsAnswered} ${t.questionsText || 'questions'}</p>
                    </div>
                    <p style="color: #ff69b4; margin-bottom: 20px;">${t.notGoodEnough || 'Not good enough for TOP 3!'}</p>
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button ontouchend="Game.closeGameOver(); event.preventDefault();" onclick="Game.closeGameOver()" style="
                            background: linear-gradient(145deg, #00ff00, #00aa00);
                            border: none;
                            border-radius: 15px;
                            padding: 20px 40px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.5rem;
                            color: white;
                            cursor: pointer;
                            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
                            transition: transform 0.2s;
                            -webkit-tap-highlight-color: transparent;
                            touch-action: manipulation;
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            🔄 ${t.tryAgain || 'TRY AGAIN!'}
                        </button>
                        <button ontouchend="Game.exitGame(); event.preventDefault();" onclick="Game.exitGame()" style="
                            background: linear-gradient(145deg, #ff4444, #aa0000);
                            border: none;
                            border-radius: 15px;
                            padding: 20px 40px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.5rem;
                            color: white;
                            cursor: pointer;
                            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                            transition: transform 0.2s;
                            -webkit-tap-highlight-color: transparent;
                            touch-action: manipulation;
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            🚪 EXIT
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(gameOverOverlay);
        }
    },
    
    closeGameOver() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) overlay.remove();
        this.showModeSelection();
    },
    
    exitGame() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) overlay.remove();
        
        // Show play button again
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    submitHighscore() {
        const nameInput = DOM.get('highscore-name');
        const name = nameInput?.value.trim() || 'Anonymous';
        
        HighscoreSystem.save(name, GameState.score, GameState.chaosMode ? 'chaos' : 'normal');
        
        const entry = DOM.get('highscore-entry');
        if (entry) entry.style.display = 'none';
        
        this.showModeSelection();
    },
    
    triggerJumpscare() {
        console.log('💀 JUMPSCARE!', GameState.chaosMode ? '(CHAOS)' : '');
        GameState.jumpscareTriggered = true;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Pause game
        const wasActive = GameState.active;
        GameState.active = false;
        this.clearTimers();
        
        // Create TERRIFYING overlay
        const overlay = document.createElement('div');
        overlay.id = 'jumpscare-overlay';
        
        const isChaos = GameState.chaosMode;
        const duration = isChaos ? 3000 : 2500; // Longer duration
        
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: ${isChaos ? 'linear-gradient(45deg, #ff0000, #000, #ff0000, #000)' : '#000'};
            background-size: 800% 800%;
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: ${isChaos ? 'jumpscareFlashChaos 0.03s infinite, jumpscareZoom 0.1s infinite' : 'jumpscareFlash 0.08s infinite'};
            overflow: hidden;
        `;
        
        // Add CSS animations dynamically
        const style = document.createElement('style');
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
        
        // Main scary image
        const img = document.createElement('img');
        img.src = 'images/jumpscare.jpeg';
        img.style.cssText = `
            width: 120%;
            height: 120%;
            object-fit: cover;
            animation: ${isChaos ? 'jumpscareShakeExtreme 0.02s infinite' : 'jumpscareShakeExtreme 0.05s infinite'};
            filter: ${isChaos ? 'contrast(1.5) saturate(1.5)' : 'contrast(1.2)'};
        `;
        
        overlay.appendChild(img);
        
        // Add blood drip effect in chaos mode
        if (isChaos) {
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
        }
        
        // Add scary text
        const text = document.createElement('div');
        text.textContent = isChaos ? '💀 GAME OVER 💀' : '👻 BOO! 👻';
        text.style.cssText = `
            position: absolute;
            font-family: 'Creepster', 'Bangers', cursive;
            font-size: ${isChaos ? '8rem' : '5rem'};
            color: ${isChaos ? '#FF0000' : '#FFFFFF'};
            text-shadow: 
                0 0 20px #FF0000,
                0 0 40px #FF0000,
                0 0 60px #FF0000,
                4px 4px 0 #000,
                -4px -4px 0 #000;
            animation: ${isChaos ? 'jumpscareZoom 0.05s infinite' : 'jumpscareZoom 0.1s infinite'};
            z-index: 10;
            pointer-events: none;
        `;
        overlay.appendChild(text);
        
        document.body.appendChild(overlay);
        
        // Play LOUD scream - use GYAAAAAAAAAT sound file!
        const gyaaatSound = new Audio('SOUND/71_GYAAAAAAAAAT_bass_boosted.mp3');
        gyaaatSound.volume = 1.0;
        gyaaatSound.play().catch(e => console.log('Jumpscare audio failed:', e));
        
        // Also play synth scream for extra terror
        AudioSystem.playScream(isChaos);
        
        // Vibrate device if supported (mobile)
        if (navigator.vibrate) {
            navigator.vibrate(isChaos ? [100, 50, 100, 50, 200, 50, 300] : [200, 100, 200]);
        }
        
        // Remove after duration
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
            
            if (wasActive) {
                GameState.active = true;
                this.startTimers();
                TickSystem.start();
                this.nextQuestion();
            }
        }, duration);
    }
};

// ===== WHO IS IT HIGHSCORE =====
const WhoIsItHighscore = {
    key: 'whoisit_highscores',
    
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch {
            return [];
        }
    },
    
    save(name, score) {
        const scores = this.get();
        scores.push({ name, score, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        const top10 = scores.slice(0, 10);
        localStorage.setItem(this.key, JSON.stringify(top10));
        return top10;
    },
    
    isHighscore(score) {
        const scores = this.get();
        return scores.length < 10 || score > (scores[scores.length - 1]?.score || 0);
    },
    
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = this.get();
        if (scores.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center;">No scores yet!</p>';
            return;
        }
        
        container.innerHTML = scores.slice(0, 5).map((s, i) => `
            <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(153,50,204,0.2); margin:5px 0; border-radius:8px; border-left:3px solid ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#9932cc'};">
                <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔊'} ${s.name}</span>
                <span style="color:#ffff00; font-weight:bold;">${s.score}</span>
            </div>
        `).join('');
    }
};

// ===== WHO IS IT GAME =====
const WhoIsItGame = {
    active: false,
    score: 0,
    round: 1,
    lives: 5,
    maxLives: 5,
    currentCharacter: null,
    choices: [],
    questionTimer: null,
    questionTimeLeft: 15,
    questionStartTime: 0,
    usedCharacters: [],
    
    start() {
        this.active = true;
        this.score = 0;
        this.round = 1;
        this.lives = 5;
        this.usedCharacters = [];
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('whoisit-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        // Init audio
        AudioSystem.init();
        
        this.updateUI();
        this.nextQuestion();
    },
    
    stop() {
        this.active = false;
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        const overlay = document.getElementById('whoisit-overlay');
        if (overlay) overlay.style.display = 'none';
    },
    
    nextQuestion() {
        if (!this.active) return;
        
        const characters = window.italianBrainrotCharacters || [];
        if (characters.length < 4) return;
        
        // Get available characters (not used yet)
        let available = characters.filter(c => !this.usedCharacters.includes(c.name));
        
        // Reset if we've used most characters
        if (available.length < 4) {
            this.usedCharacters = [];
            available = characters;
        }
        
        // Pick correct answer
        const correctIndex = Math.floor(Math.random() * available.length);
        this.currentCharacter = available[correctIndex];
        this.usedCharacters.push(this.currentCharacter.name);
        
        // Pick 3 wrong answers
        const wrongChoices = [];
        const otherChars = available.filter(c => c.name !== this.currentCharacter.name);
        while (wrongChoices.length < 3 && otherChars.length > 0) {
            const idx = Math.floor(Math.random() * otherChars.length);
            wrongChoices.push(otherChars.splice(idx, 1)[0]);
        }
        
        // Shuffle all 4 choices
        this.choices = [this.currentCharacter, ...wrongChoices]
            .sort(() => Math.random() - 0.5);
        
        this.renderChoices();
        this.playCurrentName();
        this.startTimer();
    },
    
    renderChoices() {
        const container = document.getElementById('whoisit-choices');
        if (!container) return;
        
        container.innerHTML = this.choices.map((char, index) => `
            <div class="whoisit-choice" 
                 onclick="WhoIsItGame.checkAnswer(${index})"
                 ontouchend="WhoIsItGame.checkAnswer(${index}); event.preventDefault();">
                <img src="${char.image}" alt="?" loading="lazy" 
                     onerror="this.src='images/placeholder.png'">
            </div>
        `).join('');
        
        // Start timing for speed bonus
        this.questionStartTime = Date.now();
    },
    
    playCurrentName() {
        if (!this.currentCharacter) return;
        
        // Use shared AudioSystem for consistent voice
        AudioSystem.speakName(this.currentCharacter.name);
        
        // Visual feedback on button
        const btn = document.getElementById('whoisit-play-sound');
        if (btn) {
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        }
    },
    
    checkAnswer(choiceIndex) {
        if (!this.active) return;
        
        // Stop timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        const chosen = this.choices[choiceIndex];
        const isCorrect = chosen.name === this.currentCharacter.name;
        const choiceElements = document.querySelectorAll('.whoisit-choice');
        const reactionTime = Date.now() - this.questionStartTime;
        
        if (isCorrect) {
            // Calculate speed bonus (max 200 extra points for < 1 second)
            const speedBonus = Math.max(0, Math.floor(200 - (reactionTime / 50)));
            const totalPoints = 100 + speedBonus;
            this.score += totalPoints;
            
            AudioSystem.playCorrect();
            choiceElements[choiceIndex].classList.add('correct');
            
            // Show correct feedback with speed bonus
            if (speedBonus > 100) {
                this.showFeedback(`⚡ LIGHTNING! +${totalPoints}`, '#00ff00');
            } else if (speedBonus > 50) {
                this.showFeedback(`🔥 FAST! +${totalPoints}`, '#00ff00');
            } else {
                this.showFeedback(`✅ CORRECT! +${totalPoints}`, '#00ff00');
            }
        } else {
            // Wrong!
            this.lives--;
            AudioSystem.playWrong();
            choiceElements[choiceIndex].classList.add('wrong');
            
            // Show which was correct
            const correctIndex = this.choices.findIndex(c => c.name === this.currentCharacter.name);
            if (correctIndex >= 0) {
                choiceElements[correctIndex].classList.add('correct');
            }
            
            this.showFeedback(`❌ WRONG! It was ${this.currentCharacter.name}`, '#ff0000');
        }
        
        this.updateUI();
        
        // Check game over
        if (this.lives <= 0) {
            setTimeout(() => this.gameOver(), 1500);
            return;
        }
        
        // Next question after delay
        this.round++;
        setTimeout(() => this.nextQuestion(), 1500);
    },
    
    startTimer() {
        this.questionTimeLeft = 15;
        const timerBar = document.getElementById('whoisit-timer-bar');
        
        if (this.questionTimer) clearInterval(this.questionTimer);
        
        this.questionTimer = setInterval(() => {
            this.questionTimeLeft -= 0.1;
            
            if (timerBar) {
                const percent = (this.questionTimeLeft / 15) * 100;
                timerBar.style.width = percent + '%';
                timerBar.style.background = percent < 30 ? '#ff0000' : 
                                            percent < 60 ? '#ffaa00' : '#00ff00';
            }
            
            if (this.questionTimeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.timeUp();
            }
        }, 100);
    },
    
    timeUp() {
        if (!this.active) return;
        
        this.lives--;
        AudioSystem.playWrong();
        
        // Show correct answer
        const correctIndex = this.choices.findIndex(c => c.name === this.currentCharacter.name);
        const choiceElements = document.querySelectorAll('.whoisit-choice');
        if (correctIndex >= 0 && choiceElements[correctIndex]) {
            choiceElements[correctIndex].classList.add('correct');
        }
        
        this.showFeedback(`⏰ TIME UP! It was ${this.currentCharacter.name}`, '#ffaa00');
        this.updateUI();
        
        if (this.lives <= 0) {
            setTimeout(() => this.gameOver(), 1500);
            return;
        }
        
        this.round++;
        setTimeout(() => this.nextQuestion(), 1500);
    },
    
    updateUI() {
        const scoreEl = document.getElementById('whoisit-score');
        const roundEl = document.getElementById('whoisit-round');
        const livesEl = document.getElementById('whoisit-lives');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (roundEl) roundEl.textContent = this.round;
        if (livesEl) {
            livesEl.textContent = '❤️'.repeat(this.lives) + '💔'.repeat(this.maxLives - this.lives);
        }
    },
    
    showFeedback(text, color) {
        // Create floating feedback
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bangers', cursive;
            font-size: 2rem;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            z-index: 100000;
            pointer-events: none;
            animation: feedbackPop 1s ease-out forwards;
        `;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 1000);
    },
    
    gameOver() {
        this.active = false;
        this.stop();
        
        const t = translations[currentLanguage] || translations.en;
        
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.id = 'whoisit-gameover';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        `;
        
        const isHighscore = WhoIsItHighscore.isHighscore(this.score);
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #1a0033, #330066);
                border: 4px solid #9932cc;
                border-radius: 25px;
                padding: 40px;
                text-align: center;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 0 50px rgba(153, 50, 204, 0.5);
                position: relative;
            ">
                <!-- X Close button -->
                <button onclick="WhoIsItGame.exit()" ontouchend="WhoIsItGame.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff69b4;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                    color: #ff69b4;
                    cursor: pointer;
                    touch-action: manipulation;
                ">✕</button>
                
                <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: #ff69b4; margin-bottom: 15px;">
                    🔊 WHO IS IT? - GAME OVER!
                </h2>
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                    <p style="font-size: 1.2rem; color: #00ffff;">🏆 Final Score:</p>
                    <p style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ffff00;">${this.score}</p>
                    <p style="font-size: 1rem; color: #aaa;">✅ ${this.round - 1} rounds completed</p>
                </div>
                
                ${isHighscore ? `
                    <div style="background: rgba(255,215,0,0.2); padding: 15px; border-radius: 15px; margin-bottom: 20px; border: 2px solid gold;">
                        <p style="color: gold; font-size: 1.2rem; margin-bottom: 10px;">🎉 NEW HIGHSCORE! Enter your name:</p>
                        <input type="text" id="whoisit-name" maxlength="15" placeholder="Your name" style="
                            width: 80%;
                            padding: 10px;
                            font-size: 1.2rem;
                            border: 2px solid #9932cc;
                            border-radius: 10px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            text-align: center;
                        " value="">
                        <button onclick="WhoIsItGame.submitHighscore()" style="
                            margin-top: 10px;
                            background: linear-gradient(145deg, gold, #ffa500);
                            border: none;
                            border-radius: 10px;
                            padding: 10px 20px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.1rem;
                            color: black;
                            cursor: pointer;
                        ">💾 SAVE SCORE</button>
                    </div>
                ` : `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                        <p style="color: #9932cc; font-size: 1rem; margin-bottom: 10px;">🏆 TOP SCORES:</p>
                        <div id="whoisit-highscore-display"></div>
                    </div>
                `}
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="WhoIsItGame.restart()" ontouchend="WhoIsItGame.restart(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #00ff00, #00aa00);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
                        touch-action: manipulation;
                    ">🔄 PLAY AGAIN</button>
                    <button onclick="WhoIsItGame.exit()" ontouchend="WhoIsItGame.exit(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #ff4444, #aa0000);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                        touch-action: manipulation;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Render highscores if not a new highscore
        if (!isHighscore) {
            WhoIsItHighscore.render('whoisit-highscore-display');
        }
    },
    
    submitHighscore() {
        const nameInput = document.getElementById('whoisit-name');
        const name = nameInput?.value.trim() || 'Anonymous';
        
        WhoIsItHighscore.save(name, this.score);
        
        // Replace input with highscore list
        const overlay = document.getElementById('whoisit-gameover');
        if (overlay) {
            const inputSection = overlay.querySelector('div[style*="gold"]');
            if (inputSection) {
                inputSection.innerHTML = `
                    <p style="color: #00ff00; font-size: 1.2rem; margin-bottom: 10px;">✅ Score saved!</p>
                    <p style="color: #9932cc; font-size: 1rem; margin-bottom: 10px;">🏆 TOP SCORES:</p>
                    <div id="whoisit-highscore-display"></div>
                `;
                inputSection.style.borderColor = '#00ff00';
                inputSection.style.background = 'rgba(0,255,0,0.1)';
                WhoIsItHighscore.render('whoisit-highscore-display');
            }
        }
    },
    
    restart() {
        const overlay = document.getElementById('whoisit-gameover');
        if (overlay) overlay.remove();
        this.start();
    },
    
    exit() {
        const overlay = document.getElementById('whoisit-gameover');
        if (overlay) overlay.remove();
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===== MEMORY HIGHSCORE =====
const MemoryHighscore = {
    key: 'memory_highscores',
    
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch {
            return [];
        }
    },
    
    save(name, timeMs, moves) {
        const scores = this.get();
        scores.push({ name, timeMs, moves, date: Date.now() });
        // Sort by fastest time
        scores.sort((a, b) => a.timeMs - b.timeMs);
        const top10 = scores.slice(0, 10);
        localStorage.setItem(this.key, JSON.stringify(top10));
        return top10;
    },
    
    isHighscore(timeMs) {
        const scores = this.get();
        return scores.length < 10 || timeMs < (scores[scores.length - 1]?.timeMs || Infinity);
    },
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = ms % 1000;
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    },
    
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = this.get();
        if (scores.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center;">No times yet!</p>';
            return;
        }
        
        container.innerHTML = scores.slice(0, 5).map((s, i) => `
            <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,255,0,0.2); margin:5px 0; border-radius:8px; border-left:3px solid ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#00ff00'};">
                <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🧠'} ${s.name}</span>
                <span style="color:#00ff00; font-weight:bold;">${this.formatTime(s.timeMs)}</span>
            </div>
        `).join('');
    }
};

// ===== MEMORY GAME =====
const MemoryGame = {
    active: false,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 15,
    moves: 0,
    startTime: 0,
    timerInterval: null,
    isLocked: false,
    
    start() {
        this.active = true;
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.startTime = 0;
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.setupCards();
        this.renderCards();
        this.updateUI();
        
        // Timer starts on first card flip
    },
    
    setupCards() {
        const characters = window.italianBrainrotCharacters || [];
        if (characters.length < this.totalPairs) return;
        
        // Pick random characters for pairs
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, this.totalPairs);
        
        // Create pairs (each character appears twice)
        this.cards = [];
        selected.forEach((char, index) => {
            this.cards.push({ id: index * 2, pairId: index, character: char, flipped: false, matched: false });
            this.cards.push({ id: index * 2 + 1, pairId: index, character: char, flipped: false, matched: false });
        });
        
        // Shuffle cards
        this.cards.sort(() => Math.random() - 0.5);
    },
    
    renderCards() {
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        
        grid.innerHTML = this.cards.map((card, index) => `
            <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" 
                 data-index="${index}"
                 onclick="MemoryGame.flipCard(${index})"
                 ontouchend="MemoryGame.flipCard(${index}); event.preventDefault();">
                <div class="memory-card-inner">
                    <div class="memory-card-front"></div>
                    <div class="memory-card-back">
                        <img src="${card.character.image}" alt="${card.character.name}" 
                             onerror="this.src='images/placeholder.png'">
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    flipCard(index) {
        if (!this.active || this.isLocked) return;
        
        const card = this.cards[index];
        if (!card || card.flipped || card.matched) return;
        
        // Start timer on first flip
        if (this.startTime === 0) {
            this.startTime = Date.now();
            this.startTimer();
        }
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(index);
        
        // Update visual
        const cardEl = document.querySelector(`.memory-card[data-index="${index}"]`);
        if (cardEl) cardEl.classList.add('flipped');
        
        // Play sound
        AudioSystem.init();
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            this.checkMatch();
        }
    },
    
    checkMatch() {
        this.isLocked = true;
        
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.pairId === card2.pairId) {
            // Match!
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            
            AudioSystem.playCorrect();
            
            // Add matched class
            document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.add('matched');
            document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.add('matched');
            
            this.flippedCards = [];
            this.isLocked = false;
            this.updateUI();
            
            // Check win
            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        } else {
            // No match - flip back after delay
            AudioSystem.playWrong();
            
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                
                document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.remove('flipped');
                
                this.flippedCards = [];
                this.isLocked = false;
            }, 800);
        }
    },
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const timeEl = document.getElementById('memory-time');
            if (timeEl) {
                timeEl.textContent = MemoryHighscore.formatTime(elapsed);
            }
        }, 10); // Update every 10ms for smooth display
    },
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    updateUI() {
        const pairsEl = document.getElementById('memory-pairs');
        const movesEl = document.getElementById('memory-moves');
        
        if (pairsEl) pairsEl.textContent = `${this.matchedPairs}/${this.totalPairs}`;
        if (movesEl) movesEl.textContent = this.moves;
    },
    
    gameWon() {
        this.active = false;
        this.stopTimer();
        
        const finalTime = Date.now() - this.startTime;
        const isHighscore = MemoryHighscore.isHighscore(finalTime);
        
        // Create win overlay
        const overlay = document.createElement('div');
        overlay.id = 'memory-gameover';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #003300, #006600);
                border: 4px solid #00ff00;
                border-radius: 25px;
                padding: 40px;
                text-align: center;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
                position: relative;
            ">
                <!-- X Close button -->
                <button onclick="MemoryGame.closeGameOver()" ontouchend="MemoryGame.closeGameOver(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #00ff00;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                    color: #00ff00;
                    cursor: pointer;
                    touch-action: manipulation;
                ">✕</button>
                
                <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: #00ff00; margin-bottom: 15px;">
                    🎉 MEMORY COMPLETE!
                </h2>
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                    <p style="font-size: 1.2rem; color: #00ffff;">⏱️ Your Time:</p>
                    <p style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ffff00;">${MemoryHighscore.formatTime(finalTime)}</p>
                    <p style="font-size: 1rem; color: #aaa;">👆 ${this.moves} moves</p>
                </div>
                
                ${isHighscore ? `
                    <div style="background: rgba(255,215,0,0.2); padding: 15px; border-radius: 15px; margin-bottom: 20px; border: 2px solid gold;">
                        <p style="color: gold; font-size: 1.2rem; margin-bottom: 10px;">🎉 NEW RECORD! Enter your name:</p>
                        <input type="text" id="memory-name" maxlength="15" placeholder="Your name" style="
                            width: 80%;
                            padding: 10px;
                            font-size: 1.2rem;
                            border: 2px solid #00ff00;
                            border-radius: 10px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            text-align: center;
                        " value="">
                        <button onclick="MemoryGame.submitHighscore(${finalTime})" style="
                            margin-top: 10px;
                            background: linear-gradient(145deg, gold, #ffa500);
                            border: none;
                            border-radius: 10px;
                            padding: 10px 20px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.1rem;
                            color: black;
                            cursor: pointer;
                        ">💾 SAVE TIME</button>
                    </div>
                ` : `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                        <p style="color: #00ff00; font-size: 1rem; margin-bottom: 10px;">🏆 FASTEST TIMES:</p>
                        <div id="memory-highscore-display"></div>
                    </div>
                `}
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="MemoryGame.restart()" ontouchend="MemoryGame.restart(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #00ff00, #00aa00);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
                        touch-action: manipulation;
                    ">🔄 PLAY AGAIN</button>
                    <button onclick="MemoryGame.closeGameOver()" ontouchend="MemoryGame.closeGameOver(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #ff4444, #aa0000);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                        touch-action: manipulation;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Render highscores if not a new record
        if (!isHighscore) {
            MemoryHighscore.render('memory-highscore-display');
        }
    },
    
    submitHighscore(timeMs) {
        const nameInput = document.getElementById('memory-name');
        const name = nameInput?.value.trim() || 'Anonymous';
        
        MemoryHighscore.save(name, timeMs, this.moves);
        
        // Replace input with highscore list
        const overlay = document.getElementById('memory-gameover');
        if (overlay) {
            const inputSection = overlay.querySelector('div[style*="gold"]');
            if (inputSection) {
                inputSection.innerHTML = `
                    <p style="color: #00ff00; font-size: 1.2rem; margin-bottom: 10px;">✅ Time saved!</p>
                    <p style="color: #00ff00; font-size: 1rem; margin-bottom: 10px;">🏆 FASTEST TIMES:</p>
                    <div id="memory-highscore-display"></div>
                `;
                inputSection.style.borderColor = '#00ff00';
                inputSection.style.background = 'rgba(0,255,0,0.1)';
                MemoryHighscore.render('memory-highscore-display');
            }
        }
    },
    
    restart() {
        this.closeGameOver();
        this.start();
    },
    
    closeGameOver() {
        const overlay = document.getElementById('memory-gameover');
        if (overlay) overlay.remove();
    },
    
    exit() {
        this.active = false;
        this.stopTimer();
        this.closeGameOver();
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===== 2 PLAYER MEMORY GAME =====
const Memory2P = {
    active: false,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 15,
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    isLocked: false,
    
    start() {
        this.active = true;
        this.matchedPairs = 0;
        this.currentPlayer = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        this.flippedCards = [];
        this.isLocked = false;
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.setupCards();
        this.renderGame();
    },
    
    setupCards() {
        const characters = window.italianBrainrotCharacters || [];
        if (characters.length < this.totalPairs) return;
        
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, this.totalPairs);
        
        this.cards = [];
        selected.forEach((char, index) => {
            this.cards.push({ id: index * 2, pairId: index, character: char, flipped: false, matched: false });
            this.cards.push({ id: index * 2 + 1, pairId: index, character: char, flipped: false, matched: false });
        });
        
        this.cards.sort(() => Math.random() - 0.5);
    },
    
    renderGame() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Player Scores -->
            <div class="player-indicator">
                <div class="player-score player1 ${this.currentPlayer === 1 ? 'active' : ''}">
                    👤 PLAYER 1<br>
                    <span style="font-size: 2rem;">${this.player1Score}</span>
                </div>
                <div class="player-score player2 ${this.currentPlayer === 2 ? 'active' : ''}">
                    👤 PLAYER 2<br>
                    <span style="font-size: 2rem;">${this.player2Score}</span>
                </div>
            </div>
            
            <!-- Turn Indicator -->
            <div class="turn-indicator ${this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn'}">
                🎯 PLAYER ${this.currentPlayer}'S TURN!
            </div>
            
            <!-- Memory Grid -->
            <div id="memory-grid" class="memory-grid">
                ${this.cards.map((card, index) => `
                    <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" 
                         data-index="${index}"
                         onclick="Memory2P.flipCard(${index})"
                         ontouchend="Memory2P.flipCard(${index}); event.preventDefault();">
                        <div class="memory-card-inner">
                            <div class="memory-card-front"></div>
                            <div class="memory-card-back">
                                <img src="${card.character.image}" alt="${card.character.name}" 
                                     onerror="this.src='images/placeholder.png'">
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Exit Button -->
            <button onclick="Memory2P.exit()" ontouchend="Memory2P.exit(); event.preventDefault();" style="
                margin-top: 20px;
                background: linear-gradient(145deg, #ff4444, #aa0000);
                border: none;
                border-radius: 15px;
                padding: 12px 25px;
                font-family: 'Bangers', cursive;
                font-size: 1.2rem;
                color: white;
                cursor: pointer;
                touch-action: manipulation;
            ">🚪 EXIT GAME</button>
        `;
    },
    
    flipCard(index) {
        if (!this.active || this.isLocked) return;
        
        const card = this.cards[index];
        if (!card || card.flipped || card.matched) return;
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(index);
        
        // Update visual
        const cardEl = document.querySelector(`.memory-card[data-index="${index}"]`);
        if (cardEl) cardEl.classList.add('flipped');
        
        AudioSystem.init();
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    },
    
    checkMatch() {
        this.isLocked = true;
        
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.pairId === card2.pairId) {
            // Match! Current player gets a point and another turn
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            
            if (this.currentPlayer === 1) {
                this.player1Score++;
            } else {
                this.player2Score++;
            }
            
            AudioSystem.playCorrect();
            
            // Add matched class
            document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.add('matched');
            document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.add('matched');
            
            this.flippedCards = [];
            this.isLocked = false;
            
            // Update scores (keep same player's turn)
            this.updateScores();
            this.showFeedback(`✅ MATCH! Player ${this.currentPlayer} goes again!`, this.currentPlayer === 1 ? '#0096ff' : '#ff6464');
            
            // Check win
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.gameOver(), 500);
            }
        } else {
            // No match - switch players
            AudioSystem.playWrong();
            
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                
                document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.remove('flipped');
                
                this.flippedCards = [];
                this.isLocked = false;
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                this.updateScores();
                this.updateTurnIndicator();
            }, 800);
        }
    },
    
    updateScores() {
        const p1 = document.querySelector('.player-score.player1');
        const p2 = document.querySelector('.player-score.player2');
        
        if (p1) {
            p1.innerHTML = `👤 PLAYER 1<br><span style="font-size: 2rem;">${this.player1Score}</span>`;
            p1.classList.toggle('active', this.currentPlayer === 1);
        }
        if (p2) {
            p2.innerHTML = `👤 PLAYER 2<br><span style="font-size: 2rem;">${this.player2Score}</span>`;
            p2.classList.toggle('active', this.currentPlayer === 2);
        }
    },
    
    updateTurnIndicator() {
        const indicator = document.querySelector('.turn-indicator');
        if (indicator) {
            indicator.className = `turn-indicator ${this.currentPlayer === 1 ? 'player1-turn' : 'player2-turn'}`;
            indicator.textContent = `🎯 PLAYER ${this.currentPlayer}'S TURN!`;
        }
    },
    
    showFeedback(text, color) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bangers', cursive;
            font-size: 1.8rem;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            z-index: 100000;
            pointer-events: none;
            animation: feedbackPop 1s ease-out forwards;
            background: rgba(0,0,0,0.8);
            padding: 15px 25px;
            border-radius: 15px;
        `;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    },
    
    gameOver() {
        this.active = false;
        
        let winner, winnerColor;
        if (this.player1Score > this.player2Score) {
            winner = 'PLAYER 1 WINS!';
            winnerColor = '#0096ff';
        } else if (this.player2Score > this.player1Score) {
            winner = 'PLAYER 2 WINS!';
            winnerColor = '#ff6464';
        } else {
            winner = "IT'S A TIE!";
            winnerColor = '#ffff00';
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'memory2p-gameover';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 4px solid ${winnerColor};
                border-radius: 25px;
                padding: 40px;
                text-align: center;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 0 50px ${winnerColor};
                position: relative;
            ">
                <!-- X Close button -->
                <button onclick="Memory2P.closeGameOver()" ontouchend="Memory2P.closeGameOver(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid ${winnerColor};
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                    color: ${winnerColor};
                    cursor: pointer;
                    touch-action: manipulation;
                ">✕</button>
                
                <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: ${winnerColor}; margin-bottom: 20px; text-shadow: 0 0 20px ${winnerColor};">
                    🎉 ${winner}
                </h2>
                
                <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 25px;">
                    <div style="background: rgba(0, 150, 255, 0.3); padding: 20px; border-radius: 15px; border: 3px solid #0096ff;">
                        <div style="color: #0096ff; font-size: 1.2rem;">👤 PLAYER 1</div>
                        <div style="font-family: 'Bangers', cursive; font-size: 3rem; color: white;">${this.player1Score}</div>
                    </div>
                    <div style="background: rgba(255, 100, 100, 0.3); padding: 20px; border-radius: 15px; border: 3px solid #ff6464;">
                        <div style="color: #ff6464; font-size: 1.2rem;">👤 PLAYER 2</div>
                        <div style="font-family: 'Bangers', cursive; font-size: 3rem; color: white;">${this.player2Score}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="Memory2P.restart()" ontouchend="Memory2P.restart(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #00ff00, #00aa00);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
                        touch-action: manipulation;
                    ">🔄 REMATCH</button>
                    <button onclick="Memory2P.closeGameOver()" ontouchend="Memory2P.closeGameOver(); event.preventDefault();" style="
                        background: linear-gradient(145deg, #ff4444, #aa0000);
                        border: none;
                        border-radius: 15px;
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        color: white;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                        touch-action: manipulation;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    restart() {
        this.closeGameOver();
        this.start();
    },
    
    closeGameOver() {
        const overlay = document.getElementById('memory2p-gameover');
        if (overlay) overlay.remove();
    },
    
    exit() {
        this.active = false;
        this.closeGameOver();
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===== HARDCORE MEMORY HIGHSCORE =====
const MemoryHCHighscore = {
    key: 'italianBrainrot_memoryHC_highscores',
    
    getScores() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch {
            return [];
        }
    },
    
    saveScore(name, time) {
        const scores = this.getScores();
        scores.push({ name: name || 'Anonymous', time, date: new Date().toISOString() });
        scores.sort((a, b) => a.time - b.time);
        const top5 = scores.slice(0, 5);
        localStorage.setItem(this.key, JSON.stringify(top5));
        return top5;
    },
    
    isHighscore(time) {
        const scores = this.getScores();
        if (scores.length < 5) return true;
        return time < scores[scores.length - 1].time;
    },
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const millis = Math.floor((ms % 1000) / 10);
        return `${minutes}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
    },
    
    renderScores(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = this.getScores();
        if (scores.length === 0) {
            container.innerHTML = '<span style="color: #888;">No records yet!</span>';
            return;
        }
        
        container.innerHTML = scores.map((s, i) => 
            `<div style="color: ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#ff6666'}; margin: 5px 0;">
                ${i + 1}. ${s.name}: ${this.formatTime(s.time)}
            </div>`
        ).join('');
    }
};

// ===== HARDCORE MEMORY GAME =====
const MemoryHardcore = {
    active: false,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 15,
    consecutiveMistakes: 0,
    isLocked: false,
    startTime: 0,
    timerInterval: null,
    shuffleInterval: null,
    shuffleCountdown: 10,
    shuffleCount: 0,
    
    start() {
        this.active = true;
        this.matchedPairs = 0;
        this.consecutiveMistakes = 0;
        this.shuffleCount = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.startTime = 0;
        this.shuffleCountdown = 10;
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.setupCards();
        this.renderGame();
    },
    
    setupCards() {
        const characters = window.italianBrainrotCharacters || [];
        if (characters.length < this.totalPairs) return;
        
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, this.totalPairs);
        
        this.cards = [];
        selected.forEach((char, index) => {
            this.cards.push({ id: index * 2, pairId: index, character: char, flipped: false, matched: false });
            this.cards.push({ id: index * 2 + 1, pairId: index, character: char, flipped: false, matched: false });
        });
        
        this.cards.sort(() => Math.random() - 0.5);
    },
    
    renderGame() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Hardcore Stats -->
            <div class="hardcore-stats">
                <div class="shuffle-countdown">
                    🔄 IDLE: <span id="hc-shuffle-time">${this.shuffleCountdown}</span>s
                    <div style="font-size: 0.7rem; color: #aaa;">Click to reset!</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #ff0000;">💀 HARDCORE</div>
                </div>
                <div class="mistakes-counter">
                    ❌ STREAK: <span id="hc-streak">${this.consecutiveMistakes}/5</span>
                    <div style="font-size: 0.7rem; color: #aaa;">5 wrong = shuffle!</div>
                </div>
            </div>
            
            <!-- Timer -->
            <div class="game-header" style="justify-content: center; margin-bottom: 10px;">
                <div class="game-stat">
                    <span class="game-stat-label">⏱️ TIME:</span>
                    <span id="hc-time" class="game-stat-value" style="color: #ff4444;">0.000s</span>
                </div>
                <div class="game-stat">
                    <span class="game-stat-label">PAIRS:</span>
                    <span id="hc-pairs" class="game-stat-value">${this.matchedPairs}/${this.totalPairs}</span>
                </div>
            </div>
            
            <!-- Memory Grid -->
            <div id="memory-grid" class="memory-grid">
                ${this.renderCards()}
            </div>
            
            <!-- Exit Button -->
            <button onclick="MemoryHardcore.exit()" ontouchend="MemoryHardcore.exit(); event.preventDefault();" style="
                margin-top: 20px;
                background: linear-gradient(145deg, #ff4444, #aa0000);
                border: none;
                border-radius: 15px;
                padding: 12px 25px;
                font-family: 'Bangers', cursive;
                font-size: 1.2rem;
                color: white;
                cursor: pointer;
                touch-action: manipulation;
            ">🚪 EXIT GAME</button>
        `;
    },
    
    renderCards() {
        return this.cards.map((card, index) => `
            <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" 
                 data-index="${index}"
                 onclick="MemoryHardcore.flipCard(${index})"
                 ontouchend="MemoryHardcore.flipCard(${index}); event.preventDefault();">
                <div class="memory-card-inner">
                    <div class="memory-card-front" style="border-color: #ff0000; box-shadow: 0 0 10px rgba(255,0,0,0.3);"></div>
                    <div class="memory-card-back" style="border-color: #ff0000;">
                        <img src="${card.character.image}" alt="${card.character.name}" 
                             onerror="this.src='images/placeholder.png'">
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    flipCard(index) {
        if (!this.active || this.isLocked) return;
        
        const card = this.cards[index];
        if (!card || card.flipped || card.matched) return;
        
        // Start timer and shuffle on first flip
        if (this.startTime === 0) {
            this.startTime = Date.now();
            this.startTimer();
            this.startShuffleCountdown();
        } else {
            // Reset shuffle countdown on every card flip!
            this.resetShuffleCountdown();
        }
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(index);
        
        const cardEl = document.querySelector(`.memory-card[data-index="${index}"]`);
        if (cardEl) cardEl.classList.add('flipped');
        
        AudioSystem.init();
        
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    },
    
    checkMatch() {
        this.isLocked = true;
        
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.pairId === card2.pairId) {
            // Match!
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.consecutiveMistakes = 0; // Reset consecutive mistakes
            
            AudioSystem.playCorrect();
            
            document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.add('matched');
            document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.add('matched');
            
            this.flippedCards = [];
            this.isLocked = false;
            this.updateUI();
            
            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        } else {
            // No match
            this.consecutiveMistakes++;
            AudioSystem.playWrong();
            
            this.updateUI();
            
            // 5 consecutive mistakes = SHUFFLE!
            if (this.consecutiveMistakes >= 5) {
                this.showFeedback('💀 5 WRONG IN A ROW! SHUFFLING!', '#ff0000');
                this.consecutiveMistakes = 0;
                
                setTimeout(() => {
                    card1.flipped = false;
                    card2.flipped = false;
                    document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.remove('flipped');
                    document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.remove('flipped');
                    this.flippedCards = [];
                    
                    // Shuffle after flip back
                    setTimeout(() => {
                        this.shuffleCards();
                        this.isLocked = false;
                    }, 300);
                }, 800);
            } else {
                this.showFeedback(`❌ WRONG! (${this.consecutiveMistakes}/5)`, '#ff0000');
                
                setTimeout(() => {
                    card1.flipped = false;
                    card2.flipped = false;
                    
                    document.querySelector(`.memory-card[data-index="${index1}"]`)?.classList.remove('flipped');
                    document.querySelector(`.memory-card[data-index="${index2}"]`)?.classList.remove('flipped');
                    
                    this.flippedCards = [];
                    this.isLocked = false;
                }, 800);
            }
        }
    },
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const timeEl = document.getElementById('hc-time');
            if (timeEl) {
                timeEl.textContent = MemoryHighscore.formatTime(elapsed);
            }
        }, 10);
    },
    
    startShuffleCountdown() {
        if (this.shuffleInterval) clearInterval(this.shuffleInterval);
        
        this.shuffleCountdown = 10;
        this.updateShuffleDisplay();
        
        this.shuffleInterval = setInterval(() => {
            if (!this.active) {
                clearInterval(this.shuffleInterval);
                return;
            }
            
            this.shuffleCountdown--;
            this.updateShuffleDisplay();
            
            if (this.shuffleCountdown <= 0) {
                this.shuffleCards();
                this.shuffleCountdown = 10;
                this.updateShuffleDisplay();
            }
        }, 1000);
    },
    
    resetShuffleCountdown() {
        // Reset to 10 seconds when player makes a move
        this.shuffleCountdown = 10;
        this.updateShuffleDisplay();
    },
    
    updateShuffleDisplay() {
        const countdownEl = document.getElementById('hc-shuffle-time');
        if (countdownEl) {
            countdownEl.textContent = this.shuffleCountdown;
            
            // Warning colors
            if (this.shuffleCountdown <= 3) {
                countdownEl.style.color = '#ff0000';
                countdownEl.style.fontSize = '2rem';
                countdownEl.style.animation = 'pulse 0.5s ease-in-out infinite';
            } else if (this.shuffleCountdown <= 5) {
                countdownEl.style.color = '#ffaa00';
                countdownEl.style.fontSize = '';
                countdownEl.style.animation = '';
            } else {
                countdownEl.style.color = '';
                countdownEl.style.fontSize = '';
                countdownEl.style.animation = '';
            }
        }
    },
    
    shuffleCards() {
        if (!this.active) return;
        
        // Count shuffles
        this.shuffleCount++;
        
        // Show shuffle warning
        this.showFeedback('🔄 SHUFFLING!', '#ffaa00');
        
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        
        // Get all unmatched card elements and their positions
        const cardElements = Array.from(grid.querySelectorAll('.memory-card'));
        const unmatchedCards = [];
        const unmatchedPositions = [];
        
        cardElements.forEach((cardEl, index) => {
            const card = this.cards[index];
            if (!card.matched) {
                const rect = cardEl.getBoundingClientRect();
                unmatchedCards.push({ el: cardEl, card: card, index: index });
                unmatchedPositions.push({ x: rect.left, y: rect.top });
            }
        });
        
        if (unmatchedCards.length < 2) return;
        
        // Flip unmatched cards face down first
        unmatchedCards.forEach(item => {
            item.card.flipped = false;
            item.el.classList.remove('flipped');
        });
        this.flippedCards = [];
        
        // Shuffle the positions array
        const shuffledPositions = [...unmatchedPositions];
        for (let i = shuffledPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
        }
        
        // Animate cards flying to new positions
        unmatchedCards.forEach((item, i) => {
            const startPos = unmatchedPositions[unmatchedCards.indexOf(item)];
            const endPos = shuffledPositions[i];
            
            const deltaX = endPos.x - startPos.x;
            const deltaY = endPos.y - startPos.y;
            
            item.el.style.transition = 'transform 0.6s ease-in-out';
            item.el.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${Math.random() * 20 - 10}deg)`;
            item.el.style.zIndex = '100';
        });
        
        // After animation, actually shuffle the data and re-render
        setTimeout(() => {
            // Shuffle the card data for unmatched positions
            const unmatchedIndices = this.cards
                .map((card, index) => ({ card, index }))
                .filter(item => !item.card.matched)
                .map(item => item.index);
            
            const cardsToShuffle = unmatchedIndices.map(i => this.cards[i]);
            for (let i = cardsToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
            }
            
            unmatchedIndices.forEach((originalIndex, i) => {
                this.cards[originalIndex] = cardsToShuffle[i];
            });
            
            // Re-render grid with new positions
            grid.innerHTML = this.renderCards();
        }, 600);
    },
    
    stopTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.shuffleInterval) {
            clearInterval(this.shuffleInterval);
            this.shuffleInterval = null;
        }
    },
    
    updateUI() {
        const pairsEl = document.getElementById('hc-pairs');
        const streakEl = document.getElementById('hc-streak');
        
        if (pairsEl) pairsEl.textContent = `${this.matchedPairs}/${this.totalPairs}`;
        if (streakEl) {
            streakEl.textContent = `${this.consecutiveMistakes}/5`;
            // Color based on danger level
            if (this.consecutiveMistakes >= 4) {
                streakEl.style.color = '#ff0000';
            } else if (this.consecutiveMistakes >= 2) {
                streakEl.style.color = '#ffaa00';
            } else {
                streakEl.style.color = '';
            }
        }
    },
    
    showFeedback(text, color) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bangers', cursive;
            font-size: 2rem;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            z-index: 100000;
            pointer-events: none;
            animation: feedbackPop 1s ease-out forwards;
            background: rgba(0,0,0,0.8);
            padding: 15px 25px;
            border-radius: 15px;
        `;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    },
    
    gameWon() {
        this.active = false;
        this.stopTimers();
        
        const finalTime = Date.now() - this.startTime;
        const isHighscore = MemoryHCHighscore.isHighscore(finalTime);
        
        const overlay = document.createElement('div');
        overlay.id = 'memoryhc-gameover';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #1a0000, #330000);
                border: 4px solid #00ff00;
                border-radius: 25px;
                padding: 40px;
                text-align: center;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
                position: relative;
            ">
                <button onclick="MemoryHardcore.closeGameOver()" style="
                    position: absolute; top: 10px; right: 10px;
                    background: rgba(255,255,255,0.1); border: 2px solid #00ff00;
                    border-radius: 50%; width: 40px; height: 40px;
                    font-size: 1.5rem; color: #00ff00; cursor: pointer;
                ">✕</button>
                
                <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: #00ff00; margin-bottom: 15px;">
                    💀 HARDCORE COMPLETE! 💀
                </h2>
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                    <p style="font-size: 1.2rem; color: #00ffff;">⏱️ Your Time:</p>
                    <p style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ffff00;">${MemoryHighscore.formatTime(finalTime)}</p>
                    <p style="font-size: 1rem; color: #ff6666;">🔄 ${this.shuffleCount} shuffles survived</p>
                </div>
                
                ${isHighscore ? `
                    <div style="background: rgba(255,215,0,0.2); padding: 15px; border-radius: 15px; margin-bottom: 20px; border: 2px solid gold;">
                        <p style="color: gold; font-size: 1.2rem; margin-bottom: 10px;">🎉 NEW RECORD! Enter your name:</p>
                        <input type="text" id="memoryhc-name" maxlength="15" placeholder="Your name" style="
                            width: 80%;
                            padding: 10px;
                            font-size: 1.2rem;
                            border: 2px solid #ff0000;
                            border-radius: 10px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            text-align: center;
                        " value="">
                        <button onclick="MemoryHardcore.submitHighscore(${finalTime})" style="
                            margin-top: 10px;
                            background: linear-gradient(145deg, gold, #ffa500);
                            border: none;
                            border-radius: 10px;
                            padding: 10px 20px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.1rem;
                            color: black;
                            cursor: pointer;
                        ">💾 SAVE TIME</button>
                    </div>
                ` : `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                        <p style="color: #ff0000; font-size: 1rem; margin-bottom: 10px;">🏆 FASTEST HARDCORE TIMES:</p>
                        <div id="memoryhc-highscore-display"></div>
                    </div>
                `}
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="MemoryHardcore.restart()" style="
                        background: linear-gradient(145deg, #ff0000, #aa0000);
                        border: none; border-radius: 15px; padding: 15px 30px;
                        font-family: 'Bangers', cursive; font-size: 1.3rem;
                        color: white; cursor: pointer;
                        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                    ">💀 AGAIN!</button>
                    <button onclick="MemoryHardcore.closeGameOver()" style="
                        background: linear-gradient(145deg, #666, #444);
                        border: none; border-radius: 15px; padding: 15px 30px;
                        font-family: 'Bangers', cursive; font-size: 1.3rem;
                        color: white; cursor: pointer;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Render highscores if not a new record
        if (!isHighscore) {
            MemoryHCHighscore.renderScores('memoryhc-highscore-display');
        }
    },
    
    submitHighscore(time) {
        const nameInput = document.getElementById('memoryhc-name');
        const name = nameInput ? nameInput.value.trim() : 'Anonymous';
        MemoryHCHighscore.saveScore(name || 'Anonymous', time);
        this.closeGameOver();
        this.start();
    },
    
    restart() {
        this.closeGameOver();
        this.start();
    },
    
    closeGameOver() {
        const overlay = document.getElementById('memoryhc-gameover');
        if (overlay) overlay.remove();
    },
    
    exit() {
        this.active = false;
        this.stopTimers();
        this.closeGameOver();
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===== GLOBAL FUNCTIONS (for HTML onclick) =====
window.Game = Game;
window.WhoIsItGame = WhoIsItGame;
window.MemoryGame = MemoryGame;
window.Memory2P = Memory2P;
window.MemoryHardcore = MemoryHardcore;
window.showGameModeSelection = () => Game.showModeSelection();
window.selectGameMode = (mode) => {
    if (mode === 'whoisit') {
        WhoIsItGame.start();
    } else if (mode === 'memory') {
        MemoryGame.start();
    } else if (mode === 'memory2p') {
        Memory2P.start();
    } else if (mode === 'memoryhc') {
        MemoryHardcore.start();
    } else if (mode === 'speedremember') {
        SpeedRememberGame.start();
    } else if (mode === 'speedremember2p') {
        SpeedRemember2P.start();
    } else if (mode === 'connect4') {
        Connect4Game.start();
    } else if (mode === 'crush') {
        CrushGame.start();
    } else if (mode === 'flappy') {
        FlappyGame.start();
    } else {
        Game.selectMode(mode);
    }
};
window.submitHighscore = () => Game.submitHighscore();

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Wait for characters to load
    const checkCharacters = setInterval(() => {
        if (window.italianBrainrotCharacters) {
            clearInterval(checkCharacters);
            Game.init();
            
            // Preload voices for TTS
            if ('speechSynthesis' in window) {
                speechSynthesis.getVoices();
            }
        }
    }, 100);
});

// ===== SPEED REMEMBER GAME =====
const SpeedRememberGame = {
    active: false,
    cards: [],
    totalCards: 25,
    foundCards: 0,
    lives: 3,
    score: 0,
    currentTarget: null,
    memorizeTime: 10,
    phase: 'memorize', // 'memorize', 'play', 'gameover'
    startTime: 0,
    roundStartTime: 0,
    highscoreKey: 'brainrot_speedremember_highscores',
    
    start() {
        this.active = true;
        this.foundCards = 0;
        this.lives = 3;
        this.score = 0;
        this.phase = 'memorize';
        this.startTime = Date.now();
        
        // Get random characters
        const allChars = window.italianBrainrotCharacters || [];
        const shuffled = [...allChars].sort(() => Math.random() - 0.5);
        this.cards = shuffled.slice(0, this.totalCards).map((char, i) => ({
            ...char,
            index: i,
            found: false
        }));
        
        // Hide play button
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = 'none';
        
        // Hide games menu
        const menu = document.getElementById('game-mode-selection');
        if (menu) menu.style.display = 'none';
        
        // Show memory overlay (reuse)
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        this.renderMemorizePhase();
    },
    
    renderMemorizePhase() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-family: 'Bangers', cursive; font-size: 2rem; color: #ff6600; text-shadow: 0 0 20px #ff6600;">
                    ⚡ SPEED REMEMBER ⚡
                </div>
                <div style="font-family: 'Bangers', cursive; font-size: 1.2rem; color: #ffff00; margin-top: 10px;">
                    MEMORIZE! <span id="sr-countdown" class="speedremember-countdown">${this.memorizeTime}</span>
                </div>
            </div>
            
            <div class="speedremember-grid" id="sr-grid">
                ${this.cards.map((card, i) => `
                    <div class="speedremember-card face-up" data-index="${i}">
                        <img src="${card.image}" alt="${card.name}" 
                             onerror="this.src='images/placeholder.png'">
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 15px;">
                <div style="color: #00ffff; font-size: 0.9rem;">Remember where each character is!</div>
            </div>
        `;
        
        // Start countdown
        let timeLeft = this.memorizeTime;
        const countdownEl = document.getElementById('sr-countdown');
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownEl) countdownEl.textContent = timeLeft;
            
            if (timeLeft <= 3) {
                countdownEl.style.color = '#ff0000';
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                this.startPlayPhase();
            }
        }, 1000);
    },
    
    startPlayPhase() {
        this.phase = 'play';
        
        // Flip all cards face down
        const cards = document.querySelectorAll('.speedremember-card');
        cards.forEach(card => {
            card.classList.remove('face-up');
            card.classList.add('face-down');
            card.innerHTML = ''; // Remove image
        });
        
        // Pick first target
        this.nextTarget();
    },
    
    nextTarget() {
        // Find cards not yet found
        const remaining = this.cards.filter(c => !c.found);
        
        if (remaining.length === 0) {
            this.gameWon();
            return;
        }
        
        // Pick random target
        this.currentTarget = remaining[Math.floor(Math.random() * remaining.length)];
        this.roundStartTime = Date.now();
        
        this.renderPlayPhase();
    },
    
    renderPlayPhase() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #ff6600;">
                    ⚡ FIND THIS CHARACTER! ⚡
                </div>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                    <div style="color: #00ff00;">✅ Found: ${this.foundCards}/${this.totalCards}</div>
                    <div style="color: #ff6666;">❤️ Lives: ${this.lives}</div>
                    <div style="color: #ffff00;">🏆 Score: ${this.score}</div>
                </div>
            </div>
            
            <div class="speedremember-target">
                <img src="${this.currentTarget.image}" alt="${this.currentTarget.name}"
                     onerror="this.src='images/placeholder.png'">
                <div style="font-family: 'Bangers', cursive; font-size: 1.3rem; color: #ffff00; margin-top: 8px;">
                    ${this.currentTarget.name}
                </div>
            </div>
            
            <div class="speedremember-grid" id="sr-grid">
                ${this.cards.map((card, i) => `
                    <div class="speedremember-card face-down ${card.found ? 'found' : ''}" 
                         data-index="${i}"
                         onclick="SpeedRememberGame.selectCard(${i})">
                        ${card.found ? `<img src="${card.image}" style="opacity: 0.3;">` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    selectCard(index) {
        if (!this.active || this.phase !== 'play') return;
        
        const card = this.cards[index];
        if (card.found) return;
        
        const cardEl = document.querySelector(`.speedremember-card[data-index="${index}"]`);
        
        if (card.index === this.currentTarget.index) {
            // Correct!
            card.found = true;
            this.foundCards++;
            
            // Speed bonus (max 500 for instant, min 50)
            const reactionTime = Date.now() - this.roundStartTime;
            const speedBonus = Math.max(50, Math.floor(500 - reactionTime / 10));
            this.score += 100 + speedBonus;
            
            AudioSystem.playCorrect();
            
            if (cardEl) {
                cardEl.classList.remove('face-down');
                cardEl.classList.add('correct', 'found');
                cardEl.innerHTML = `<img src="${card.image}" style="opacity: 0.3;">`;
            }
            
            // Show feedback
            this.showFeedback(`✅ +${100 + speedBonus} points!`, '#00ff00');
            
            setTimeout(() => {
                this.nextTarget();
            }, 800);
            
        } else {
            // Wrong!
            this.lives--;
            AudioSystem.playWrong();
            
            if (cardEl) {
                cardEl.classList.add('wrong');
                setTimeout(() => cardEl.classList.remove('wrong'), 500);
            }
            
            this.showFeedback(`❌ Wrong! ${this.lives} lives left`, '#ff0000');
            
            if (this.lives <= 0) {
                setTimeout(() => this.gameOver(), 500);
            } else {
                // Show all cards for 3 seconds as penalty/help
                this.showCardsTemporarily();
            }
        }
    },
    
    showCardsTemporarily() {
        this.phase = 'reveal'; // Prevent clicking during reveal
        
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-family: 'Bangers', cursive; font-size: 2rem; color: #ff0000; text-shadow: 0 0 20px #ff0000;">
                    ❌ WRONG! MEMORIZE AGAIN!
                </div>
                <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #ffff00; margin-top: 10px;">
                    <span id="sr-reveal-countdown" class="speedremember-countdown" style="color: #ff0000;">3</span>
                </div>
            </div>
            
            <div class="speedremember-grid" id="sr-grid">
                ${this.cards.map((card, i) => `
                    <div class="speedremember-card face-up ${card.found ? 'found' : ''}" data-index="${i}">
                        <img src="${card.image}" alt="${card.name}" 
                             style="${card.found ? 'opacity: 0.3;' : ''}"
                             onerror="this.src='images/placeholder.png'">
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 10px;">
                <div style="color: #ff6666;">❤️ Lives: ${this.lives}</div>
            </div>
        `;
        
        // Countdown
        let timeLeft = 3;
        const countdownEl = document.getElementById('sr-reveal-countdown');
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownEl) countdownEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                this.phase = 'play';
                this.renderPlayPhase();
            }
        }, 1000);
    },
    
    showFeedback(text, color) {
        const existing = document.getElementById('sr-feedback');
        if (existing) existing.remove();
        
        const feedback = document.createElement('div');
        feedback.id = 'sr-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bangers', cursive;
            font-size: 2rem;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            z-index: 9999;
            pointer-events: none;
            animation: feedbackPop 0.8s ease-out forwards;
        `;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 800);
    },
    
    gameWon() {
        this.active = false;
        this.phase = 'gameover';
        
        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const isHighscore = this.isHighscore(this.score);
        
        AudioSystem.playCorrect();
        
        this.showGameOver(true, totalTime, isHighscore);
    },
    
    gameOver() {
        this.active = false;
        this.phase = 'gameover';
        
        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const isHighscore = this.isHighscore(this.score);
        
        this.showGameOver(false, totalTime, isHighscore);
    },
    
    showGameOver(won, totalTime, isHighscore) {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; position: relative;">
                <!-- X Close button -->
                <button onclick="SpeedRememberGame.exit()" ontouchend="SpeedRememberGame.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff6600;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: #ff6600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
                <div style="font-family: 'Bangers', cursive; font-size: 3rem; color: ${won ? '#00ff00' : '#ff0000'}; text-shadow: 0 0 30px currentColor;">
                    ${won ? '🎉 PERFECT! 🎉' : '💀 GAME OVER 💀'}
                </div>
                
                <div style="margin: 20px 0; font-size: 1.2rem;">
                    <div style="color: #ffff00;">🏆 Score: ${this.score}</div>
                    <div style="color: #00ffff;">✅ Found: ${this.foundCards}/${this.totalCards}</div>
                    <div style="color: #ff69b4;">⏱️ Time: ${totalTime}s</div>
                </div>
                
                ${isHighscore ? `
                    <div style="margin: 20px 0;">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #ffff00;">🏆 NEW HIGHSCORE! 🏆</div>
                        <input type="text" id="sr-name-input" placeholder="Enter name" maxlength="15" style="
                            margin-top: 10px;
                            padding: 10px 20px;
                            font-size: 1.2rem;
                            border: 2px solid #ffff00;
                            border-radius: 10px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            text-align: center;
                        ">
                        <button onclick="SpeedRememberGame.submitHighscore()" style="
                            display: block;
                            margin: 10px auto;
                            padding: 10px 30px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.2rem;
                            background: linear-gradient(145deg, #ffff00, #ff6600);
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                        ">SAVE SCORE</button>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button onclick="SpeedRememberGame.start()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #00ff00, #00aa00);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                        text-shadow: 0 0 10px rgba(0,0,0,0.5);
                    ">🔄 PLAY AGAIN</button>
                    <button onclick="SpeedRememberGame.exit()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #ff0000, #aa0000);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                        text-shadow: 0 0 10px rgba(0,0,0,0.5);
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
    },
    
    isHighscore(score) {
        const scores = JSON.parse(localStorage.getItem(this.highscoreKey) || '[]');
        return scores.length < 3 || score > (scores[2]?.score || 0);
    },
    
    submitHighscore() {
        const nameInput = document.getElementById('sr-name-input');
        const name = nameInput?.value.trim() || 'Anonymous';
        
        let scores = JSON.parse(localStorage.getItem(this.highscoreKey) || '[]');
        scores.push({ name, score: this.score, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 3);
        localStorage.setItem(this.highscoreKey, JSON.stringify(scores));
        
        this.exit();
    },
    
    renderHighscores(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = JSON.parse(localStorage.getItem(this.highscoreKey) || '[]');
        
        if (scores.length === 0) {
            container.innerHTML = '<span style="color: #888;">No scores yet</span>';
            return;
        }
        
        container.innerHTML = scores.map((s, i) => 
            `<span style="color: ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32'};">${i + 1}. ${s.name}: ${s.score}</span>`
        ).join(' | ');
    },
    
    exit() {
        this.active = false;
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.SpeedRememberGame = SpeedRememberGame;

// ===== SPEED REMEMBER 2 PLAYER =====
const SpeedRemember2P = {
    active: false,
    cards: [],
    totalCards: 16, // 4x4 grid - better for mobile
    currentTarget: null,
    phase: 'memorize',
    memorizeTime: 10, // 10 seconds to memorize
    
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    
    start() {
        this.active = true;
        this.phase = 'memorize';
        this.currentPlayer = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        
        // Get random characters
        const allChars = window.italianBrainrotCharacters || [];
        const shuffled = [...allChars].sort(() => Math.random() - 0.5);
        this.cards = shuffled.slice(0, this.totalCards).map((char, i) => ({
            ...char,
            index: i,
            found: false,
            foundBy: null
        }));
        
        // Hide play button & menu
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = 'none';
        const menu = document.getElementById('game-mode-selection');
        if (menu) menu.style.display = 'none';
        
        // Show overlay
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        this.renderMemorizePhase();
    },
    
    renderMemorizePhase() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-family: 'Bangers', cursive; font-size: 2rem; color: #ff00ff; text-shadow: 0 0 20px #ff00ff;">
                    👥 SPEED REMEMBER 2P 👥
                </div>
                <div style="font-family: 'Bangers', cursive; font-size: 1.2rem; color: #ffff00; margin-top: 10px;">
                    BOTH PLAYERS MEMORIZE! <span id="sr2p-countdown" class="speedremember-countdown">${this.memorizeTime}</span>
                </div>
            </div>
            
            <div class="speedremember-grid" id="sr2p-grid" style="grid-template-columns: repeat(4, 1fr); max-width: 320px;">
                ${this.cards.map((card, i) => `
                    <div class="speedremember-card face-up" data-index="${i}">
                        <img src="${card.image}" alt="${card.name}" 
                             onerror="this.src='images/placeholder.png'">
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 10px; color: #00ffff; font-size: 0.9rem;">
                Both players: Remember where each character is!
            </div>
        `;
        
        let timeLeft = this.memorizeTime;
        const countdownEl = document.getElementById('sr2p-countdown');
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownEl) countdownEl.textContent = timeLeft;
            if (timeLeft <= 3) countdownEl.style.color = '#ff0000';
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                this.startPlayPhase();
            }
        }, 1000);
    },
    
    startPlayPhase() {
        this.phase = 'play';
        this.nextTarget();
    },
    
    nextTarget() {
        const remaining = this.cards.filter(c => !c.found);
        
        if (remaining.length === 0) {
            this.gameOver();
            return;
        }
        
        this.currentTarget = remaining[Math.floor(Math.random() * remaining.length)];
        this.renderPlayPhase();
    },
    
    renderPlayPhase() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        const p1Color = this.currentPlayer === 1 ? '#00ff00' : '#666';
        const p2Color = this.currentPlayer === 2 ? '#00ffff' : '#666';
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 10px;">
                    <div style="padding: 10px 20px; border-radius: 10px; border: 3px solid ${p1Color}; background: rgba(0,255,0,0.1);">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.2rem; color: ${p1Color};">P1</div>
                        <div style="font-size: 1.5rem; color: #00ff00;">${this.player1Score}</div>
                    </div>
                    <div style="padding: 10px 20px; border-radius: 10px; border: 3px solid ${p2Color}; background: rgba(0,255,255,0.1);">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.2rem; color: ${p2Color};">P2</div>
                        <div style="font-size: 1.5rem; color: #00ffff;">${this.player2Score}</div>
                    </div>
                </div>
                <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: ${this.currentPlayer === 1 ? '#00ff00' : '#00ffff'};">
                    PLAYER ${this.currentPlayer}'s TURN!
                </div>
            </div>
            
            <div class="speedremember-target">
                <img src="${this.currentTarget.image}" alt="${this.currentTarget.name}"
                     onerror="this.src='images/placeholder.png'">
                <div style="font-family: 'Bangers', cursive; font-size: 1.3rem; color: #ffff00; margin-top: 8px;">
                    ${this.currentTarget.name}
                </div>
            </div>
            
            <div class="speedremember-grid" id="sr2p-grid" style="grid-template-columns: repeat(4, 1fr); max-width: 320px;">
                ${this.cards.map((card, i) => `
                    <div class="speedremember-card ${card.found ? 'found' : 'face-down'}" 
                         data-index="${i}"
                         style="${card.found ? `border-color: ${card.foundBy === 1 ? '#00ff00' : '#00ffff'};` : ''}"
                         onclick="SpeedRemember2P.selectCard(${i})">
                        ${card.found ? `<img src="${card.image}" style="opacity: 0.4;">` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    selectCard(index) {
        if (!this.active || this.phase !== 'play') return;
        
        const card = this.cards[index];
        if (card.found) return;
        
        const cardEl = document.querySelector(`.speedremember-card[data-index="${index}"]`);
        
        if (card.index === this.currentTarget.index) {
            // Correct!
            card.found = true;
            card.foundBy = this.currentPlayer;
            
            if (this.currentPlayer === 1) {
                this.player1Score++;
            } else {
                this.player2Score++;
            }
            
            AudioSystem.playCorrect();
            
            if (cardEl) {
                cardEl.classList.remove('face-down');
                cardEl.classList.add('found');
                cardEl.style.borderColor = this.currentPlayer === 1 ? '#00ff00' : '#00ffff';
                cardEl.innerHTML = `<img src="${card.image}" style="opacity: 0.4;">`;
            }
            
            this.showFeedback(`✅ P${this.currentPlayer} CORRECT! Go again!`, this.currentPlayer === 1 ? '#00ff00' : '#00ffff');
            
            // Same player continues
            setTimeout(() => this.nextTarget(), 800);
            
        } else {
            // Wrong - switch player and show cards briefly
            AudioSystem.playWrong();
            
            if (cardEl) {
                cardEl.classList.add('wrong');
                setTimeout(() => cardEl.classList.remove('wrong'), 500);
            }
            
            const nextPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.showFeedback(`❌ Wrong! Player ${nextPlayer}'s turn!`, '#ff0000');
            
            this.currentPlayer = nextPlayer;
            
            // Show all cards for 1 second
            this.showCardsTemporarily();
        }
    },
    
    showFeedback(text, color) {
        const existing = document.getElementById('sr2p-feedback');
        if (existing) existing.remove();
        
        const feedback = document.createElement('div');
        feedback.id = 'sr2p-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bangers', cursive;
            font-size: 1.8rem;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            z-index: 9999;
            pointer-events: none;
            animation: feedbackPop 0.8s ease-out forwards;
        `;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 800);
    },
    
    showCardsTemporarily() {
        this.phase = 'reveal';
        
        // Show all cards face up for 1 second
        const cards = document.querySelectorAll('.speedremember-card:not(.found)');
        cards.forEach((cardEl, i) => {
            const cardData = this.cards[parseInt(cardEl.dataset.index)];
            if (cardData && !cardData.found) {
                cardEl.classList.remove('face-down');
                cardEl.classList.add('face-up');
                cardEl.innerHTML = `<img src="${cardData.image}" onerror="this.src='images/placeholder.png'">`;
            }
        });
        
        setTimeout(() => {
            this.phase = 'play';
            this.renderPlayPhase();
        }, 1000);
    },
    
    gameOver() {
        this.active = false;
        this.phase = 'gameover';
        
        const winner = this.player1Score > this.player2Score ? 1 : 
                       this.player2Score > this.player1Score ? 2 : 0;
        
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; position: relative;">
                <!-- X Close button -->
                <button onclick="SpeedRemember2P.exit()" ontouchend="SpeedRemember2P.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff00ff;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: #ff00ff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
                <div style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ff00ff; text-shadow: 0 0 30px #ff00ff;">
                    🎉 GAME OVER! 🎉
                </div>
                
                <div style="display: flex; justify-content: center; gap: 40px; margin: 30px 0;">
                    <div style="padding: 20px 30px; border-radius: 15px; border: 4px solid ${winner === 1 ? '#ffd700' : '#00ff00'}; background: rgba(0,255,0,0.1);">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #00ff00;">PLAYER 1</div>
                        <div style="font-size: 3rem; color: #00ff00;">${this.player1Score}</div>
                        ${winner === 1 ? '<div style="color: #ffd700; font-size: 1.2rem;">🏆 WINNER!</div>' : ''}
                    </div>
                    <div style="padding: 20px 30px; border-radius: 15px; border: 4px solid ${winner === 2 ? '#ffd700' : '#00ffff'}; background: rgba(0,255,255,0.1);">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #00ffff;">PLAYER 2</div>
                        <div style="font-size: 3rem; color: #00ffff;">${this.player2Score}</div>
                        ${winner === 2 ? '<div style="color: #ffd700; font-size: 1.2rem;">🏆 WINNER!</div>' : ''}
                    </div>
                </div>
                
                ${winner === 0 ? '<div style="font-family: \'Bangers\', cursive; font-size: 2rem; color: #ffff00;">🤝 IT\'S A TIE!</div>' : ''}
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button onclick="SpeedRemember2P.start()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #ff00ff, #aa00aa);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                    ">🔄 REMATCH</button>
                    <button onclick="SpeedRemember2P.exit()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #ff0000, #aa0000);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
    },
    
    exit() {
        this.active = false;
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.SpeedRemember2P = SpeedRemember2P;

// ===== CONNECT 4 GAME =====
const Connect4Game = {
    active: false,
    board: [],
    rows: 6,
    cols: 7,
    currentPlayer: 1,
    player1Char: null,
    player2Char: null,
    gameOver: false,
    characterOptions: [],
    
    start() {
        // Get 3 random characters for selection
        const allChars = window.italianBrainrotCharacters || [];
        const shuffled = [...allChars].sort(() => Math.random() - 0.5);
        this.characterOptions = shuffled.slice(0, 3);
        
        this.player1Char = null;
        this.player2Char = null;
        this.currentPlayer = 1;
        this.gameOver = false;
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.showCharacterSelect(1);
    },
    
    showCharacterSelect(player) {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        const p1Color = '#ff0000';
        const p2Color = '#ffff00';
        const currentColor = player === 1 ? p1Color : p2Color;
        
        // Filter out already selected character
        const availableChars = player === 2 && this.player1Char 
            ? this.characterOptions.filter(c => c.name !== this.player1Char.name)
            : this.characterOptions;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; position: relative;">
                <!-- X Close button -->
                <button onclick="Connect4Game.exit()" ontouchend="Connect4Game.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid ${currentColor};
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: ${currentColor};
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
                <h2 style="font-family: 'Bangers', cursive; font-size: 2rem; color: ${currentColor}; margin-bottom: 20px;">
                    PLAYER ${player} - CHOOSE YOUR HERO!
                </h2>
                
                <div class="character-select">
                    ${availableChars.map((char, i) => `
                        <div class="character-option" onclick="Connect4Game.selectCharacter(${player}, ${i})" 
                             style="border-color: ${currentColor};">
                            <img src="${char.image}" alt="${char.name}" 
                                 onerror="this.src='images/placeholder.png'">
                        </div>
                    `).join('')}
                </div>
                
                <p style="color: #aaa; margin-top: 15px; font-size: 1rem;">
                    ${availableChars.map(c => c.name).join(' • ')}
                </p>
                
                <button onclick="Connect4Game.exit()" style="
                    margin-top: 20px;
                    background: linear-gradient(145deg, #666, #444);
                    border: none; border-radius: 10px; padding: 10px 20px;
                    font-family: 'Bangers', cursive; font-size: 1rem;
                    color: white; cursor: pointer;
                ">🚪 EXIT</button>
            </div>
        `;
    },
    
    selectCharacter(player, index) {
        const availableChars = player === 2 && this.player1Char 
            ? this.characterOptions.filter(c => c.name !== this.player1Char.name)
            : this.characterOptions;
        
        if (player === 1) {
            this.player1Char = availableChars[index];
            AudioSystem.speakName(this.player1Char.name);
            this.showCharacterSelect(2);
        } else {
            this.player2Char = availableChars[index];
            AudioSystem.speakName(this.player2Char.name);
            this.initBoard();
            this.renderGame();
        }
    },
    
    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            this.board.push(new Array(this.cols).fill(0));
        }
        this.currentPlayer = 1;
        this.gameOver = false;
    },
    
    renderGame() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        const p1Color = '#ff0000';
        const p2Color = '#ffff00';
        const currentColor = this.currentPlayer === 1 ? p1Color : p2Color;
        const currentChar = this.currentPlayer === 1 ? this.player1Char : this.player2Char;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 10px; position: relative;">
                <!-- X Close button -->
                <button onclick="Connect4Game.exit()" ontouchend="Connect4Game.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff00ff;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    font-size: 1rem;
                    color: #ff00ff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                ">✕</button>
                <!-- Player indicators -->
                <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                    <div style="
                        padding: 10px 20px;
                        border-radius: 15px;
                        border: 3px solid ${p1Color};
                        background: ${this.currentPlayer === 1 ? 'rgba(255,0,0,0.3)' : 'rgba(0,0,0,0.3)'};
                        ${this.currentPlayer === 1 ? 'box-shadow: 0 0 20px ' + p1Color + ';' : ''}
                    ">
                        <img src="${this.player1Char.image}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${p1Color};" 
                             onerror="this.src='images/placeholder.png'">
                        <div style="color: ${p1Color}; font-family: 'Bangers', cursive;">P1</div>
                    </div>
                    <div style="
                        padding: 10px 20px;
                        border-radius: 15px;
                        border: 3px solid ${p2Color};
                        background: ${this.currentPlayer === 2 ? 'rgba(255,255,0,0.3)' : 'rgba(0,0,0,0.3)'};
                        ${this.currentPlayer === 2 ? 'box-shadow: 0 0 20px ' + p2Color + ';' : ''}
                    ">
                        <img src="${this.player2Char.image}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${p2Color};" 
                             onerror="this.src='images/placeholder.png'">
                        <div style="color: ${p2Color}; font-family: 'Bangers', cursive;">P2</div>
                    </div>
                </div>
                
                <!-- Current turn -->
                <div style="margin-bottom: 10px;">
                    <span style="color: ${currentColor}; font-family: 'Bangers', cursive; font-size: 1.3rem;">
                        ${currentChar.name}'s TURN!
                    </span>
                </div>
                
                <!-- Board -->
                <div class="connect4-board" id="connect4-board">
                    ${this.renderBoard()}
                </div>
                
                <!-- Buttons -->
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="Connect4Game.restart()" style="
                        background: linear-gradient(145deg, #ff00ff, #aa00aa);
                        border: none; border-radius: 10px; padding: 10px 20px;
                        font-family: 'Bangers', cursive; font-size: 1rem;
                        color: white; cursor: pointer;
                    ">🔄 NEW GAME</button>
                    <button onclick="Connect4Game.exit()" style="
                        background: linear-gradient(145deg, #666, #444);
                        border: none; border-radius: 10px; padding: 10px 20px;
                        font-family: 'Bangers', cursive; font-size: 1rem;
                        color: white; cursor: pointer;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
    },
    
    renderBoard() {
        let html = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                const playerClass = cell === 1 ? 'p1' : cell === 2 ? 'p2' : '';
                const char = cell === 1 ? this.player1Char : cell === 2 ? this.player2Char : null;
                
                html += `
                    <div class="connect4-cell ${playerClass}" 
                         onclick="Connect4Game.dropPiece(${c})" 
                         data-row="${r}" data-col="${c}">
                        ${char ? `<img src="${char.image}" onerror="this.src='images/placeholder.png'">` : ''}
                    </div>
                `;
            }
        }
        return html;
    },
    
    dropPiece(col) {
        if (this.gameOver) return;
        
        // Find lowest empty row in column
        let targetRow = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                targetRow = r;
                break;
            }
        }
        
        if (targetRow === -1) return; // Column full
        
        // Place piece
        this.board[targetRow][col] = this.currentPlayer;
        
        // Play sound
        const currentChar = this.currentPlayer === 1 ? this.player1Char : this.player2Char;
        AudioSystem.speakName(currentChar.name);
        
        // Check for win
        if (this.checkWin(targetRow, col)) {
            this.gameOver = true;
            this.renderGame();
            this.highlightWin(targetRow, col);
            this.showWinner();
            return;
        }
        
        // Check for draw
        if (this.checkDraw()) {
            this.gameOver = true;
            this.renderGame();
            this.showDraw();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.renderGame();
    },
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [1, -1]   // diagonal down-left
        ];
        
        for (const [dr, dc] of directions) {
            let count = 1;
            
            // Check positive direction
            let r = row + dr, c = col + dc;
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                count++;
                r += dr;
                c += dc;
            }
            
            // Check negative direction
            r = row - dr;
            c = col - dc;
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                count++;
                r -= dr;
                c -= dc;
            }
            
            if (count >= 4) {
                this.winDirection = [dr, dc];
                this.winStart = [row, col];
                return true;
            }
        }
        
        return false;
    },
    
    highlightWin(row, col) {
        const player = this.board[row][col];
        const [dr, dc] = this.winDirection;
        const cells = [];
        
        // Find all winning cells
        let r = row, c = col;
        while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
            cells.push([r, c]);
            r -= dr;
            c -= dc;
        }
        
        r = row + dr;
        c = col + dc;
        while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
            cells.push([r, c]);
            r += dr;
            c += dc;
        }
        
        // Highlight winning cells
        cells.forEach(([wr, wc]) => {
            const cell = document.querySelector(`.connect4-cell[data-row="${wr}"][data-col="${wc}"]`);
            if (cell) cell.classList.add('winning');
        });
    },
    
    checkDraw() {
        return this.board[0].every(cell => cell !== 0);
    },
    
    showWinner() {
        const winner = this.currentPlayer;
        const winnerChar = winner === 1 ? this.player1Char : this.player2Char;
        const winnerColor = winner === 1 ? '#ff0000' : '#ffff00';
        
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.id = 'connect4-winner';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: linear-gradient(145deg, #1a001a, #330033);
                    border: 4px solid ${winnerColor};
                    border-radius: 25px;
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 0 50px ${winnerColor};
                    position: relative;
                ">
                    <!-- X Close button -->
                    <button onclick="Connect4Game.exit(); document.getElementById('connect4-winner').remove();" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid ${winnerColor};
                        border-radius: 50%;
                        width: 35px;
                        height: 35px;
                        font-size: 1.2rem;
                        color: ${winnerColor};
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">✕</button>
                    <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: ${winnerColor}; margin-bottom: 20px;">
                        🎉 PLAYER ${winner} WINS! 🎉
                    </h2>
                    <img src="${winnerChar.image}" style="
                        width: 120px; height: 120px;
                        border-radius: 50%;
                        border: 4px solid ${winnerColor};
                        box-shadow: 0 0 30px ${winnerColor};
                        margin-bottom: 15px;
                    " onerror="this.src='images/placeholder.png'">
                    <p style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: white;">
                        ${winnerChar.name}
                    </p>
                    <div style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                        <button onclick="Connect4Game.restart(); document.getElementById('connect4-winner').remove();" style="
                            background: linear-gradient(145deg, #ff00ff, #aa00aa);
                            border: none; border-radius: 15px; padding: 15px 30px;
                            font-family: 'Bangers', cursive; font-size: 1.2rem;
                            color: white; cursor: pointer;
                        ">🔄 REMATCH</button>
                        <button onclick="Connect4Game.exit(); document.getElementById('connect4-winner').remove();" style="
                            background: linear-gradient(145deg, #666, #444);
                            border: none; border-radius: 15px; padding: 15px 30px;
                            font-family: 'Bangers', cursive; font-size: 1.2rem;
                            color: white; cursor: pointer;
                        ">🚪 EXIT</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }, 500);
    },
    
    showDraw() {
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.id = 'connect4-winner';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: linear-gradient(145deg, #1a1a1a, #333);
                    border: 4px solid #888;
                    border-radius: 25px;
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    position: relative;
                ">
                    <!-- X Close button -->
                    <button onclick="Connect4Game.exit(); document.getElementById('connect4-winner').remove();" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid #888;
                        border-radius: 50%;
                        width: 35px;
                        height: 35px;
                        font-size: 1.2rem;
                        color: #888;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">✕</button>
                    <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: #888; margin-bottom: 20px;">
                        🤝 IT'S A DRAW! 🤝
                    </h2>
                    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
                        <img src="${this.player1Char.image}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ff0000;" 
                             onerror="this.src='images/placeholder.png'">
                        <img src="${this.player2Char.image}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ffff00;" 
                             onerror="this.src='images/placeholder.png'">
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                        <button onclick="Connect4Game.restart(); document.getElementById('connect4-winner').remove();" style="
                            background: linear-gradient(145deg, #ff00ff, #aa00aa);
                            border: none; border-radius: 15px; padding: 15px 30px;
                            font-family: 'Bangers', cursive; font-size: 1.2rem;
                            color: white; cursor: pointer;
                        ">🔄 REMATCH</button>
                        <button onclick="Connect4Game.exit(); document.getElementById('connect4-winner').remove();" style="
                            background: linear-gradient(145deg, #666, #444);
                            border: none; border-radius: 15px; padding: 15px 30px;
                            font-family: 'Bangers', cursive; font-size: 1.2rem;
                            color: white; cursor: pointer;
                        ">🚪 EXIT</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }, 500);
    },
    
    restart() {
        this.start();
    },
    
    exit() {
        this.active = false;
        this.gameOver = true;
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.Connect4Game = Connect4Game;

// ===== BRAINROT CRUSH HIGHSCORE =====
const CrushHighscore = {
    key: 'brainrotCrushHighscores',
    
    getScores() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch { return []; }
    },
    
    isHighscore(score) {
        const scores = this.getScores();
        return scores.length < 3 || score > scores[scores.length - 1].score;
    },
    
    addScore(name, score) {
        const scores = this.getScores();
        scores.push({ name: name.substring(0, 15), score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.key, JSON.stringify(scores.slice(0, 3)));
    },
    
    renderMini(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const scores = this.getScores();
        container.innerHTML = scores.length === 0 ? '<span style="color:#666;">No scores yet</span>' :
            scores.map((s, i) => `<span style="color: ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32'};">${i + 1}. ${s.name}: ${s.score}</span>`).join(' | ');
    }
};

// ===== BRAINROT CRUSH GAME =====
const CrushGame = {
    active: false,
    grid: [],
    rows: 8,
    cols: 8,
    selectedCell: null,
    score: 0,
    timeLeft: 5,
    timerInterval: null,
    characters: [],
    isAnimating: false,
    
    start() {
        this.active = true;
        this.score = 0;
        this.timeLeft = 5;
        this.selectedCell = null;
        this.isAnimating = false;
        this.stopTimer();
        
        // Get 6 random characters for the game
        const allChars = typeof allCharacters !== 'undefined' ? allCharacters : [];
        const shuffled = [...allChars].sort(() => Math.random() - 0.5);
        this.characters = shuffled.slice(0, 6);
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.initGrid();
        this.render();
        this.startTimer();
    },
    
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (!this.active || this.isAnimating) return;
            
            this.timeLeft -= 0.1;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 100);
    },
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    resetTimer() {
        this.timeLeft = 5;
        this.updateTimerDisplay();
    },
    
    updateTimerDisplay() {
        const timerEl = document.getElementById('crush-timer');
        const timerBar = document.getElementById('crush-timer-bar');
        
        if (timerEl) timerEl.textContent = Math.max(0, this.timeLeft).toFixed(1) + 's';
        if (timerBar) {
            const percent = (this.timeLeft / 5) * 100;
            timerBar.style.width = percent + '%';
            timerBar.style.background = percent > 50 ? '#00ff00' : percent > 25 ? '#ffff00' : '#ff0000';
        }
    },
    
    initGrid() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = this.getRandomChar();
            }
        }
        
        // Remove initial matches
        let hasMatches = true;
        while (hasMatches) {
            hasMatches = false;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    // Check horizontal
                    if (c >= 2 && this.grid[r][c] === this.grid[r][c-1] && this.grid[r][c] === this.grid[r][c-2]) {
                        this.grid[r][c] = this.getRandomChar();
                        hasMatches = true;
                    }
                    // Check vertical
                    if (r >= 2 && this.grid[r][c] === this.grid[r-1][c] && this.grid[r][c] === this.grid[r-2][c]) {
                        this.grid[r][c] = this.getRandomChar();
                        hasMatches = true;
                    }
                }
            }
        }
    },
    
    getRandomChar() {
        return Math.floor(Math.random() * this.characters.length);
    },
    
    render() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 10px; position: relative;">
                <!-- X Close button -->
                <button onclick="CrushGame.exit()" ontouchend="CrushGame.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff69b4;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: #ff69b4;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                ">✕</button>
                
                <div style="font-family: 'Bangers', cursive; font-size: 1.8rem; color: #ff69b4; margin-bottom: 10px;">
                    🍬 BRAINROT CRUSH 🍬
                </div>
                
                <div class="crush-stats">
                    <div class="crush-stat">
                        <div class="crush-stat-label">🏆 SCORE</div>
                        <div class="crush-stat-value" id="crush-score">${this.score}</div>
                    </div>
                    <div class="crush-stat">
                        <div class="crush-stat-label">⏱️ TIME</div>
                        <div class="crush-stat-value" id="crush-timer">${this.timeLeft.toFixed(1)}s</div>
                    </div>
                </div>
                
                <!-- Timer Bar -->
                <div style="width: 100%; max-width: 400px; margin: 10px auto; height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; border: 2px solid #ff69b4;">
                    <div id="crush-timer-bar" style="width: 100%; height: 100%; background: #00ff00; transition: width 0.1s linear;"></div>
                </div>
                
                <div class="crush-grid" id="crush-grid">
                    ${this.renderGrid()}
                </div>
                
                <div style="margin-top: 15px; color: #aaa; font-size: 0.9rem;">
                    Match 3+ to reset timer! 🔥
                </div>
            </div>
        `;
    },
    
    renderGrid() {
        let html = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const charIndex = this.grid[r][c];
                const char = this.characters[charIndex];
                const isSelected = this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c;
                
                html += `
                    <div class="crush-cell ${isSelected ? 'selected' : ''}" 
                         data-row="${r}" data-col="${c}"
                         onclick="CrushGame.cellClick(${r}, ${c})"
                         ontouchend="CrushGame.cellClick(${r}, ${c}); event.preventDefault();">
                        ${char ? `<img src="${char.image}" alt="${char.name}" onerror="this.src='images/placeholder.png'">` : ''}
                    </div>
                `;
            }
        }
        return html;
    },
    
    updateGrid() {
        const gridEl = document.getElementById('crush-grid');
        if (gridEl) gridEl.innerHTML = this.renderGrid();
        
        const scoreEl = document.getElementById('crush-score');
        if (scoreEl) scoreEl.textContent = this.score;
    },
    
    cellClick(r, c) {
        if (!this.active || this.isAnimating) return;
        
        if (!this.selectedCell) {
            // First selection
            this.selectedCell = { r, c };
            this.updateGrid();
        } else {
            // Second selection - check if adjacent
            const dr = Math.abs(r - this.selectedCell.r);
            const dc = Math.abs(c - this.selectedCell.c);
            
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                // Adjacent - try swap
                this.trySwap(this.selectedCell.r, this.selectedCell.c, r, c);
            } else {
                // Not adjacent - select new cell
                this.selectedCell = { r, c };
                this.updateGrid();
            }
        }
    },
    
    trySwap(r1, c1, r2, c2) {
        this.isAnimating = true;
        this.selectedCell = null;
        
        // Swap
        const temp = this.grid[r1][c1];
        this.grid[r1][c1] = this.grid[r2][c2];
        this.grid[r2][c2] = temp;
        
        // Check for matches
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // Valid move - reset timer!
            this.resetTimer();
            this.updateGrid();
            this.processMatches(matches);
        } else {
            // Invalid - swap back
            this.grid[r2][c2] = this.grid[r1][c1];
            this.grid[r1][c1] = temp;
            this.updateGrid();
            this.isAnimating = false;
        }
    },
    
    findMatches() {
        const matches = new Set();
        
        // Check horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 2; c++) {
                if (this.grid[r][c] !== -1 &&
                    this.grid[r][c] === this.grid[r][c+1] && 
                    this.grid[r][c] === this.grid[r][c+2]) {
                    matches.add(`${r},${c}`);
                    matches.add(`${r},${c+1}`);
                    matches.add(`${r},${c+2}`);
                    // Check for 4+ in a row
                    if (c + 3 < this.cols && this.grid[r][c] === this.grid[r][c+3]) {
                        matches.add(`${r},${c+3}`);
                    }
                    if (c + 4 < this.cols && this.grid[r][c] === this.grid[r][c+4]) {
                        matches.add(`${r},${c+4}`);
                    }
                }
            }
        }
        
        // Check vertical
        for (let r = 0; r < this.rows - 2; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] !== -1 &&
                    this.grid[r][c] === this.grid[r+1][c] && 
                    this.grid[r][c] === this.grid[r+2][c]) {
                    matches.add(`${r},${c}`);
                    matches.add(`${r+1},${c}`);
                    matches.add(`${r+2},${c}`);
                    // Check for 4+ in a column
                    if (r + 3 < this.rows && this.grid[r][c] === this.grid[r+3][c]) {
                        matches.add(`${r+3},${c}`);
                    }
                    if (r + 4 < this.rows && this.grid[r][c] === this.grid[r+4][c]) {
                        matches.add(`${r+4},${c}`);
                    }
                }
            }
        }
        
        return Array.from(matches).map(s => {
            const [r, c] = s.split(',').map(Number);
            return { r, c };
        });
    },
    
    processMatches(matches) {
        // Calculate score
        const points = matches.length * 10;
        this.score += points;
        
        // Play sound
        AudioSystem.init();
        
        // Show match animation
        matches.forEach(({ r, c }) => {
            const cell = document.querySelector(`.crush-cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('matched');
        });
        
        // Speak a random matched character
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        const charIndex = this.grid[randomMatch.r][randomMatch.c];
        const char = this.characters[charIndex];
        if (char) AudioSystem.speakName(char.name);
        
        // Remove matched cells after animation
        setTimeout(() => {
            matches.forEach(({ r, c }) => {
                this.grid[r][c] = -1; // Mark as empty
            });
            
            this.dropCells();
        }, 300);
    },
    
    dropCells() {
        // Drop cells down
        for (let c = 0; c < this.cols; c++) {
            let emptyRow = this.rows - 1;
            
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.grid[r][c] !== -1) {
                    if (r !== emptyRow) {
                        this.grid[emptyRow][c] = this.grid[r][c];
                        this.grid[r][c] = -1;
                    }
                    emptyRow--;
                }
            }
            
            // Fill empty cells at top
            for (let r = emptyRow; r >= 0; r--) {
                this.grid[r][c] = this.getRandomChar();
            }
        }
        
        this.updateGrid();
        
        // Check for new matches
        setTimeout(() => {
            const newMatches = this.findMatches();
            if (newMatches.length > 0) {
                this.processMatches(newMatches);
            } else {
                this.isAnimating = false;
                this.checkGameOver();
            }
        }, 350);
    },
    
    checkGameOver() {
        // Timer handles game over now
    },
    
    gameOver() {
        this.active = false;
        this.stopTimer();
        const isHighscore = CrushHighscore.isHighscore(this.score);
        
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; position: relative;">
                <!-- X Close button -->
                <button onclick="CrushGame.exit()" ontouchend="CrushGame.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #ff69b4;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: #ff69b4;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
                
                <div style="font-family: 'Bangers', cursive; font-size: 3rem; color: #ff69b4; text-shadow: 0 0 30px #ff69b4;">
                    🍬 GAME OVER! 🍬
                </div>
                
                <div style="margin: 20px 0; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 15px;">
                    <div style="font-size: 1.2rem; color: #aaa;">Final Score</div>
                    <div style="font-family: 'Bangers', cursive; font-size: 4rem; color: #ffff00;">${this.score}</div>
                </div>
                
                ${isHighscore ? `
                    <div style="margin: 20px 0;">
                        <div style="font-family: 'Bangers', cursive; font-size: 1.5rem; color: #ffd700;">🏆 NEW HIGHSCORE! 🏆</div>
                        <input type="text" id="crush-name-input" placeholder="Enter name" maxlength="15" style="
                            margin-top: 10px;
                            padding: 10px 20px;
                            font-size: 1.2rem;
                            border: 2px solid #ffd700;
                            border-radius: 10px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            text-align: center;
                        ">
                        <button onclick="CrushGame.submitHighscore()" style="
                            display: block;
                            margin: 10px auto;
                            padding: 10px 30px;
                            font-family: 'Bangers', cursive;
                            font-size: 1.2rem;
                            background: linear-gradient(145deg, #ffd700, #ff6600);
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                        ">SAVE SCORE</button>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button onclick="CrushGame.start()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #ff69b4, #aa4477);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                    ">🔄 PLAY AGAIN</button>
                    <button onclick="CrushGame.exit()" style="
                        padding: 15px 30px;
                        font-family: 'Bangers', cursive;
                        font-size: 1.3rem;
                        background: linear-gradient(145deg, #666, #444);
                        border: none;
                        border-radius: 15px;
                        cursor: pointer;
                        color: white;
                    ">🚪 EXIT</button>
                </div>
            </div>
        `;
    },
    
    submitHighscore() {
        const nameInput = document.getElementById('crush-name-input');
        const name = nameInput?.value.trim() || 'Anonymous';
        CrushHighscore.addScore(name, this.score);
        CrushHighscore.renderMini('crush-highscore-menu');
        this.gameOver(); // Re-render without highscore input
    },
    
    exit() {
        this.active = false;
        this.stopTimer();
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.CrushGame = CrushGame;

// ===== FLAPPYROT HIGHSCORE =====
const FlappyHighscore = {
    key: 'brainrot_flappy_highscores',
    
    getScores() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch { return []; }
    },
    
    addScore(name, score) {
        const scores = this.getScores();
        scores.push({ name, score, date: new Date().toISOString() });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.key, JSON.stringify(scores.slice(0, 10)));
    },
    
    isHighscore(score) {
        const scores = this.getScores();
        return scores.length < 3 || score > scores[scores.length - 1]?.score;
    },
    
    renderMini(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scores = this.getScores().slice(0, 3);
        if (scores.length === 0) {
            container.innerHTML = '<span style="color: #666;">No scores yet</span>';
            return;
        }
        
        container.innerHTML = scores.map((s, i) => 
            `<span style="color: ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32'};">${i + 1}. ${s.name}: ${s.score}</span>`
        ).join(' | ');
    }
};

// ===== FLAPPYROT GAME =====
const FlappyGame = {
    active: false,
    canvas: null,
    ctx: null,
    
    // Game dimensions
    width: 320,
    height: 480,
    
    // Bird properties (bomber goose!)
    bird: {
        x: 80,
        y: 240,
        width: 60,
        height: 60,
        velocity: 0,
        gravity: 0.5,
        jumpForce: -9,
        rotation: 0
    },
    
    // Pipes
    pipes: [],
    pipeWidth: 60,
    pipeGap: 150,
    pipeSpeed: 3,
    pipeSpawnRate: 90, // frames
    frameCount: 0,
    
    // Game state
    score: 0,
    gameOver: false,
    started: false,
    animationId: null,
    
    // Character
    character: null,
    characterImg: null,
    
    start() {
        // Stop any existing game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.removeControls();
        
        this.active = true;
        this.gameOver = false;
        this.started = false;
        this.score = 0;
        this.frameCount = 0;
        this.pipes = [];
        
        // Reset bird
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        
        // Get random character for name/sound
        const allChars = typeof allCharacters !== 'undefined' ? allCharacters : [];
        this.character = allChars[Math.floor(Math.random() * allChars.length)];
        
        // Use bomber goose as the bird!
        this.characterImg = new Image();
        this.characterImg.src = 'images/bomber_goose_flipped.gif';
        
        // Hide mode selection, show game
        const modeSelection = document.getElementById('game-mode-selection');
        const overlay = document.getElementById('memory-overlay');
        const playBtn = document.getElementById('play-quiz-btn');
        
        if (modeSelection) modeSelection.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'none';
        
        this.render();
        this.setupControls();
        this.gameLoop();
    },
    
    render() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 10px; position: relative;">
                <!-- X Close button -->
                <button onclick="FlappyGame.exit()" ontouchend="FlappyGame.exit(); event.preventDefault();" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #00ffff;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                    color: #00ffff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                ">✕</button>
                
                <div style="font-family: 'Bangers', cursive; font-size: 1.8rem; color: #00ffff; margin-bottom: 10px;">
                    🐦 FLAPPYROT 🐦
                </div>
                
                <div class="flappy-stats">
                    <div class="flappy-stat">
                        <div class="flappy-stat-label">🏆 SCORE</div>
                        <div class="flappy-stat-value" id="flappy-score">${this.score}</div>
                    </div>
                    <div class="flappy-stat">
                        <div class="flappy-stat-label">⭐ BEST</div>
                        <div class="flappy-stat-value" id="flappy-best">${FlappyHighscore.getScores()[0]?.score || 0}</div>
                    </div>
                </div>
                
                <div style="position: relative; display: inline-block;">
                    <canvas id="flappy-canvas" class="flappy-canvas" width="${this.width}" height="${this.height}"></canvas>
                    <img id="flappy-bird-img" src="images/bomber_goose_flipped.gif" style="
                        position: absolute;
                        width: ${this.bird.width}px;
                        height: ${this.bird.height}px;
                        left: ${this.bird.x}px;
                        top: ${this.bird.y}px;
                        pointer-events: none;
                        transform-origin: center center;
                        
                        border-radius: 50%;
                    ">
                </div>
                
                <div style="margin-top: 15px; color: #aaa; font-size: 0.9rem;" id="flappy-hint">
                    Tap or Space to fly! 🚀
                </div>
            </div>
        `;
        
        this.canvas = document.getElementById('flappy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.birdImg = document.getElementById('flappy-bird-img');
    },
    
    setupControls() {
        // Create bound functions if they don't exist
        if (!this.boundJump) {
            this.boundJump = this.jump.bind(this);
        }
        if (!this.boundKeydown) {
            this.boundKeydown = (e) => {
                if (e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    this.jump();
                }
            };
        }
        if (!this.boundTouch) {
            this.boundTouch = (e) => {
                e.preventDefault();
                this.jump();
            };
        }
        
        this.canvas?.addEventListener('click', this.boundJump);
        this.canvas?.addEventListener('touchstart', this.boundTouch);
        document.addEventListener('keydown', this.boundKeydown);
    },
    
    removeControls() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.boundJump);
            this.canvas.removeEventListener('touchstart', this.boundTouch);
        }
        document.removeEventListener('keydown', this.boundKeydown);
    },
    
    jump() {
        if (!this.active) return;
        
        if (this.gameOver) {
            // Restart game
            this.restart();
            return;
        }
        
        if (!this.started) {
            this.started = true;
            const hint = document.getElementById('flappy-hint');
            if (hint) hint.textContent = 'Keep flapping! 🐦';
        }
        
        this.bird.velocity = this.bird.jumpForce;
        
        // Play character name
        if (this.character) {
            AudioSystem.speakName(this.character.name);
        }
    },
    
    restart() {
        // Reset game state without full re-render
        this.gameOver = false;
        this.started = false;
        this.score = 0;
        this.frameCount = 0;
        this.pipes = [];
        
        // Reset bird
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        
        // Get new random character for sound
        const allChars = typeof allCharacters !== 'undefined' ? allCharacters : [];
        this.character = allChars[Math.floor(Math.random() * allChars.length)];
        // Keep using bomber goose
        this.characterImg = new Image();
        this.characterImg.src = 'images/bomber_goose_flipped.gif';
        
        // Update UI
        this.updateScore();
        const hint = document.getElementById('flappy-hint');
        if (hint) hint.textContent = 'Tap or Space to fly! 🚀';
        const bestEl = document.getElementById('flappy-best');
        if (bestEl) bestEl.textContent = FlappyHighscore.getScores()[0]?.score || 0;
    },
    
    gameLoop() {
        if (!this.active) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },
    
    update() {
        if (this.gameOver || !this.started) return;
        
        this.frameCount++;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Spawn pipes
        if (this.frameCount % this.pipeSpawnRate === 0) {
            this.spawnPipe();
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Score when passing pipe
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.endGame();
                return;
            }
        }
        
        // Ground/ceiling collision
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.height) {
            this.endGame();
        }
    },
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    },
    
    checkCollision(pipe) {
        const bird = this.bird;
        const birdRight = bird.x + bird.width * 0.8;
        const birdLeft = bird.x + bird.width * 0.2;
        const birdTop = bird.y + bird.height * 0.2;
        const birdBottom = bird.y + bird.height * 0.8;
        
        // Check if bird is in pipe x range
        if (birdRight > pipe.x && birdLeft < pipe.x + this.pipeWidth) {
            // Check top pipe collision
            if (birdTop < pipe.topHeight) return true;
            // Check bottom pipe collision
            if (birdBottom > pipe.bottomY) return true;
        }
        
        return false;
    },
    
    draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw white background (matches goose GIF background)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw pipes
        this.pipes.forEach(pipe => {
            // Pipe gradient
            const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            pipeGradient.addColorStop(0, '#00ff00');
            pipeGradient.addColorStop(0.5, '#00cc00');
            pipeGradient.addColorStop(1, '#009900');
            
            ctx.fillStyle = pipeGradient;
            
            // Top pipe
            ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Pipe cap
            ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
            // Pipe cap
            ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            
            // Pipe borders
            ctx.strokeStyle = '#006600';
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
        });
        
        // Update bird HTML element position (animated GIF)
        if (this.birdImg) {
            this.birdImg.style.left = this.bird.x + 'px';
            this.birdImg.style.top = this.bird.y + 'px';
            this.birdImg.style.transform = `rotate(${this.bird.rotation}deg)`;
        }
        
        // Draw ground line
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(0, this.height - 2, this.width, 2);
        
        // Draw start message
        if (!this.started && !this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.width, this.height);
            
            ctx.fillStyle = '#00ffff';
            ctx.font = "bold 24px 'Bangers', cursive";
            ctx.textAlign = 'center';
            ctx.fillText('TAP TO START', this.width / 2, this.height / 2);
            
            if (this.character) {
                ctx.font = "18px 'Bangers', cursive";
                ctx.fillStyle = '#ffff00';
                ctx.fillText(this.character.name, this.width / 2, this.height / 2 + 40);
            }
        }
        
        // Draw game over
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            
            ctx.fillStyle = '#ff0000';
            ctx.font = "bold 32px 'Bangers', cursive";
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 40);
            
            ctx.fillStyle = '#00ffff';
            ctx.font = "24px 'Bangers', cursive";
            ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
            
            ctx.fillStyle = '#aaa';
            ctx.font = "16px Arial";
            ctx.fillText('Tap to play again', this.width / 2, this.height / 2 + 50);
        }
    },
    
    updateScore() {
        const scoreEl = document.getElementById('flappy-score');
        if (scoreEl) scoreEl.textContent = this.score;
    },
    
    endGame() {
        this.gameOver = true;
        
        // Check highscore
        if (FlappyHighscore.isHighscore(this.score) && this.score > 0) {
            setTimeout(() => this.showHighscoreInput(), 500);
        }
    },
    
    showHighscoreInput() {
        const container = document.getElementById('memory-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; position: relative;">
                <button onclick="FlappyGame.exit()" style="
                    position: absolute; top: 10px; right: 10px;
                    background: rgba(255,255,255,0.1); border: 2px solid #00ffff;
                    border-radius: 50%; width: 35px; height: 35px;
                    font-size: 1.2rem; color: #00ffff; cursor: pointer;
                ">✕</button>
                
                <div style="font-family: 'Bangers', cursive; font-size: 2rem; color: #ffd700; margin-bottom: 20px;">
                    🏆 NEW HIGHSCORE! 🏆
                </div>
                
                <div style="font-size: 3rem; color: #00ffff; margin-bottom: 20px;">
                    ${this.score}
                </div>
                
                <input type="text" id="flappy-name-input" placeholder="Enter your name" maxlength="15" style="
                    padding: 15px; font-size: 1.2rem; border-radius: 10px;
                    border: 2px solid #00ffff; background: rgba(0,0,0,0.5);
                    color: white; text-align: center; width: 200px;
                ">
                
                <br><br>
                
                <button onclick="FlappyGame.submitHighscore()" style="
                    background: linear-gradient(145deg, #00ffff, #0088ff);
                    border: none; border-radius: 15px; padding: 15px 40px;
                    font-family: 'Bangers', cursive; font-size: 1.3rem;
                    color: #000; cursor: pointer;
                ">SAVE SCORE</button>
                
                <button onclick="FlappyGame.start()" style="
                    background: linear-gradient(145deg, #666, #444);
                    border: none; border-radius: 15px; padding: 15px 30px;
                    font-family: 'Bangers', cursive; font-size: 1.2rem;
                    color: white; cursor: pointer; margin-left: 10px;
                ">PLAY AGAIN</button>
            </div>
        `;
    },
    
    submitHighscore() {
        const nameInput = document.getElementById('flappy-name-input');
        const name = nameInput?.value.trim() || 'Anonymous';
        FlappyHighscore.addScore(name, this.score);
        FlappyHighscore.renderMini('flappy-highscore-menu');
        this.start();
    },
    
    exit() {
        this.active = false;
        this.gameOver = true;
        this.removeControls();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const overlay = document.getElementById('memory-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const playBtn = document.getElementById('play-quiz-btn');
        if (playBtn) playBtn.style.display = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.FlappyGame = FlappyGame;
