// ============================================
// BRAINROT BRAIN MELTDOWN 🧠💥
// Saml hjerneceller - undgå MELTDOWN!
// 15 spørgsmål, 3 boosts, epic gameplay!
// ============================================

'use strict';

// ===== GAME STATE =====
const JeopardyState = {
    active: false,
    currentQuestion: 0,
    score: 0,
    totalBrainCells: 0,      // Total opsamlede hjerneceller
    currentPotential: 0,     // Nuværende potentielle celler (tæller ned)
    lifelines: {
        brainBoost: true,      // 50:50 - fjerner 2 forkerte svar
        crowdChaos: true,      // Crowd Chaos - spørg publikum  
        callARot: true,        // Ring til en Rot
        giveMe2: true          // Giv mig 2! - 2 minutter ekstra tid
    },
    questions: [],
    selectedAnswer: null,
    isAnswerLocked: false,
    // Timer system
    timeLeft: 10,
    timerInterval: null,
    timerPaused: false,
    baseTime: 10  // Standard 10 sekunder
};

// ===== BRAIN CELL LADDER =====
// Starter ved 100, ender ved 1.000.000 hjerneceller!
const BRAIN_CELL_LADDER = [
    100, 200, 500, 1000, 2500,           // Level 1-5 (Smooth Brain)
    5000, 10000, 25000, 50000, 100000,   // Level 6-10 (Wrinkly Brain)
    250000, 500000, 750000, 900000, 1000000  // Level 11-15 (GALAXY BRAIN)
];

// Checkpoints - mister ikke alt hvis du fejler efter disse
const BRAIN_CHECKPOINTS = [4, 9];  // Efter level 5 og 10

// ===== BRAINROT FRIENDS =====
const BRAINROT_FRIENDS = [
    { name: "TRALALERO TRALALA", emoji: "🦈", catchphrase: { da: "Tralala! Jeg er ret sikker på det er", en: "Tralala! I'm pretty sure it's" }},
    { name: "BOMBARDIRO CROCODILO", emoji: "🐊", catchphrase: { da: "BOOM! Mit bomber-instinkt siger", en: "BOOM! My bomber instinct says" }},
    { name: "CAPPUCCINO ASSASSINO", emoji: "☕", catchphrase: { da: "La morte è una tazzina... svaret er", en: "La morte è una tazzina... the answer is" }},
    { name: "LIRILI LARILA", emoji: "🐘", catchphrase: { da: "*trompet lyde* Jeg tror det er", en: "*trumpet sounds* I think it's" }},
    { name: "TRIPPI TROPPI", emoji: "🍄", catchphrase: { da: "Woooah dansen... i min psykedeliske vision ser jeg", en: "Woooah dude... in my psychedelic vision I see" }},
    { name: "CHIMPANZINI BANANINI", emoji: "🐵", catchphrase: { da: "OOH OOH AH AH! Banan-hjernen siger", en: "OOH OOH AH AH! Banana-brain says" }},
    { name: "GLORBO FRUTTODRILLO", emoji: "🥝", catchphrase: { da: "Fruuugt! Min frugt-intuition siger", en: "Fruuuit! My fruit intuition says" }},
    { name: "BRR BRR PATAPIM", emoji: "🦎", catchphrase: { da: "Brrr... *zen åndedrag* Svaret er", en: "Brrr... *zen breathing* The answer is" }},
    { name: "SIGMA BOY", emoji: "😎", catchphrase: { da: "Sigma regel #47: Svaret er altid", en: "Sigma rule #47: The answer is always" }}
];

// Funktion til at finde karakter-billede
function getFriendImage(friendName) {
    if (typeof CHARACTERS === 'undefined') return null;
    const char = CHARACTERS.find(c => c.name.toUpperCase() === friendName.toUpperCase());
    return char ? char.image : null;
}

// ===== TRANSLATIONS =====
const MELTDOWN_TEXT = {
    da: {
        title: "🧠 BRAIN MELTDOWN 💥",
        subtitle: "Saml hjerneceller - undgå MELTDOWN!",
        question: "Niveau",
        prize: "Hjerneceller",
        brainCells: "hjerneceller",
        lock: "🔒 LÅS SVAR",
        brainBoost: "🧠 Hjerne-Boost",
        crowdChaos: "👥 Crowd Chaos",
        callARot: "📞 Ring en Rot",
        giveMe2: "⏰ Giv mig 2!",
        brainLadder: "🧠 HJERNECELLE-STIGE 🧠",
        smoothBrain: "Smooth Brain",
        wrinklyBrain: "Wrinkly Brain",
        galaxyBrain: "GALAXY BRAIN",
        congrats: "🎉 GALAXY BRAIN OPNÅET! 🎉",
        youAreGalaxyBrain: "DU HAR 1.000.000 HJERNECELLER!",
        meltdown: "💥 BRAIN MELTDOWN! 💥",
        wrongAnswer: "Din hjerne smeltede!",
        timeUp: "⏰ TIDEN LØB UD!",
        youCollected: "Du samlede",
        checkpoint: "Checkpoint reddet dig!",
        playAgain: "PRØV IGEN 🔄",
        crowdSays: "👥 CROWD CHAOS:",
        ok: "OK 👍",
        callingRot: "Ringer til",
        thinking: "🤔 *tænker*",
        thanksForHelp: "Tak for hjælpen! 🙏",
        notSure: "...men æææh, jeg er ikke 100% sikker...",
        maybeBe: "Måske er det",
        noNo: "Nej nej, jeg tror det er",
        timeLeft: "Tid",
        seconds: "sek",
        extraTime: "+2 MINUTTER!",
        checkpointReached: "🚩 CHECKPOINT!",
        checkpointMessage: "Du har {cells} hjerneceller! Fortsæt eller tag dine celler?",
        keepGoing: "FORTSÆT! 🚀",
        takeCells: "TAG CELLERNE 🧠",
        areYouSure: "Er du sikker?",
        finalAnswer: "Er det dit endelige svar?",
        thinkAboutIt: "Tænk dig godt om...",
        bigRisk: "Der er mange hjerneceller på spil!",
        loseItAll: "Hvis du tager fejl, smelter din hjerne!",
        crowdWrong: "Crowden er også lidt brainrotted...",
        rotWrong: "Din Rot lød ikke helt sikker...",
        stillTime: "Du har stadig tid til at skifte mening.",
        interestingChoice: "Interessant valg...",
        mostPeopleWouldnt: "De fleste ville ikke vælge det svar...",
        youLookNervous: "Du ser lidt nervøs ud...",
        trustYourGut: "Stoler du på din mavefornemmelse?",
        confirm: "JA, LÅS SVAR",
        changeAnswer: "NEJ, SKIFT SVAR",
        chooseRot: "Vælg din Rot:",
        callNow: "RING NU"
    },
    en: {
        title: "🧠 BRAIN MELTDOWN 💥",
        subtitle: "Collect brain cells - avoid MELTDOWN!",
        question: "Level",
        prize: "Brain Cells",
        brainCells: "brain cells",
        lock: "🔒 LOCK ANSWER",
        brainBoost: "🧠 Brain Boost",
        crowdChaos: "👥 Crowd Chaos",
        callARot: "📞 Call a Rot",
        giveMe2: "⏰ Give me 2!",
        brainLadder: "🧠 BRAIN CELL LADDER 🧠",
        smoothBrain: "Smooth Brain",
        wrinklyBrain: "Wrinkly Brain",
        galaxyBrain: "GALAXY BRAIN",
        congrats: "🎉 GALAXY BRAIN ACHIEVED! 🎉",
        youAreGalaxyBrain: "YOU HAVE 1,000,000 BRAIN CELLS!",
        meltdown: "💥 BRAIN MELTDOWN! 💥",
        wrongAnswer: "Your brain melted!",
        timeUp: "⏰ TIME'S UP!",
        youCollected: "You collected",
        checkpoint: "Checkpoint saved you!",
        playAgain: "TRY AGAIN 🔄",
        crowdSays: "👥 CROWD CHAOS:",
        ok: "OK 👍",
        callingRot: "Calling",
        thinking: "🤔 *thinking*",
        thanksForHelp: "Thanks for the help! 🙏",
        notSure: "...but uhhh, I'm not 100% sure...",
        maybeBe: "Maybe it's",
        noNo: "No no, I think it's",
        timeLeft: "Time",
        seconds: "sec",
        extraTime: "+2 MINUTES!",
        checkpointReached: "🚩 CHECKPOINT!",
        checkpointMessage: "You have {cells} brain cells! Continue or take your cells?",
        keepGoing: "KEEP GOING! 🚀",
        takeCells: "TAKE THE CELLS 🧠",
        areYouSure: "Are you sure?",
        finalAnswer: "Is that your final answer?",
        thinkAboutIt: "Think carefully...",
        bigRisk: "There are many brain cells at stake!",
        loseItAll: "If you're wrong, your brain melts!",
        crowdWrong: "The crowd is also a bit brainrotted...",
        rotWrong: "Your Rot didn't sound too sure...",
        stillTime: "You still have time to change your mind.",
        interestingChoice: "Interesting choice...",
        mostPeopleWouldnt: "Most people wouldn't pick that answer...",
        youLookNervous: "You look a bit nervous...",
        trustYourGut: "Do you trust your gut feeling?",
        confirm: "YES, LOCK ANSWER",
        changeAnswer: "NO, CHANGE ANSWER",
        chooseRot: "Choose your Rot:",
        callNow: "CALL NOW"
    }
};

function getMeltdownText(key) {
    const lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'da';
    return MELTDOWN_TEXT[lang]?.[key] || MELTDOWN_TEXT['da'][key] || key;
}

// Alias for backward compatibility
const JEOPARDY_TEXT = MELTDOWN_TEXT;
function getJeopardyText(key) { return getMeltdownText(key); }

// ===== 15 QUIZ QUESTIONS =====
const JEOPARDY_QUESTIONS = [
    // EASY (1-5)
    {
        question: { da: "Hvilken karakter er en haj med menneskeben?", en: "Which character is a shark with human legs?" },
        answers: ["TRALALERO TRALALA", "BOMBARDIRO CROCODILO", "CAPPUCCINO ASSASSINO", "LIRILI LARILA"],
        correct: 0
    },
    {
        question: { da: "Hvad er TUNG TUNG TUNG SAHURs hellige job?", en: "What is TUNG TUNG TUNG SAHUR's sacred job?" },
        answers: { da: ["At lave pizza", "At vække folk til Sahur", "At danse ballet", "At flyve bomber"], en: ["Making pizza", "Waking people for Sahur", "Dancing ballet", "Flying bombers"] },
        correct: 1
    },
    {
        question: { da: "Hvad er BALLERINA CAPPUCCINA lavet af?", en: "What is BALLERINA CAPPUCCINA made of?" },
        answers: { da: ["Chokolade", "Cappuccino", "Marmor", "Bananer"], en: ["Chocolate", "Cappuccino", "Marble", "Bananas"] },
        correct: 1
    },
    {
        question: { da: "Hvad er BOMBARDIRO CROCODILO bange for?", en: "What is BOMBARDIRO CROCODILO afraid of?" },
        answers: { da: ["Flyvemaskiner", "Gummiænder", "Krokodiller", "Bomber"], en: ["Airplanes", "Rubber ducks", "Crocodiles", "Bombs"] },
        correct: 1
    },
    {
        question: { da: "Hvilken karakter er en kaffe-snigmorder?", en: "Which character is a coffee assassin?" },
        answers: ["BALLERINA CAPPUCCINA", "TRIPPI TROPPI", "CAPPUCCINO ASSASSINO", "LIRILI LARILA"],
        correct: 2
    },
    // MEDIUM (6-10)
    {
        question: { da: "Hvad siger CAPPUCCINO ASSASSINO før han slår til?", en: "What does CAPPUCCINO ASSASSINO say before he strikes?" },
        answers: ["Ciao bella!", "La morte è una tazzina", "Espresso yourself!", "Coffee time!"],
        correct: 1
    },
    {
        question: { da: "Hvilken karakter kan hypnotisere fjender med dans?", en: "Which character can hypnotize enemies with dance?" },
        answers: ["BRR BRR PATAPIM", "TRALALERO TRALALA", "TUNG TUNG TUNG SAHUR", "BOMBARDIRO CROCODILO"],
        correct: 1
    },
    {
        question: { da: "Hvad er LIRILI LARILAs specielle evne?", en: "What is LIRILI LARILA's special ability?" },
        answers: { da: ["At flyve", "At lave musik med sin snabel", "At spytte ild", "At blive usynlig"], en: ["Flying", "Making music with trunk", "Spitting fire", "Becoming invisible"] },
        correct: 1
    },
    {
        question: { da: "Hvornår blev BALLERINA CAPPUCCINA født?", en: "When was BALLERINA CAPPUCCINA born?" },
        answers: ["Kl. 12:00", "Kl. 6:47", "Kl. 3:33", "Kl. 9:15"],
        correct: 1
    },
    {
        question: { da: "Hvad forårsagede BOMBARDIRO CROCODILO ved et uheld?", en: "What did BOMBARDIRO CROCODILO accidentally cause?" },
        answers: { da: ["En tsunami", "En is-krise (gelato-stand bombing)", "En jordskælv", "Et vulkanudbrud"], en: ["A tsunami", "An ice cream crisis (gelato stand bombing)", "An earthquake", "A volcanic eruption"] },
        correct: 1
    },
    // HARD (11-15)
    {
        question: { da: "Hvad er TRIPPI TROPPIs oprindelse?", en: "What is TRIPPI TROPPI's origin?" },
        answers: { da: ["En vulkan", "En diskokugle + porcini svamp ved 70'er rave", "Et laboratorium", "En regnbue"], en: ["A volcano", "A disco ball + porcini mushroom at 70s rave", "A laboratory", "A rainbow"] },
        correct: 1
    },
    {
        question: { da: "Hvad er BRR BRR PATAPAMs personlighed?", en: "What is BRR BRR PATAPAM's personality?" },
        answers: { da: ["Aggressiv og vild", "Overraskende zen og rolig", "Konstant sur", "Ekstremt snakkesalig"], en: ["Aggressive and wild", "Surprisingly zen and calm", "Constantly grumpy", "Extremely talkative"] },
        correct: 1
    },
    {
        question: { da: "Hvad skete der da TRALALERO TRALALA vandt en dance-off?", en: "What happened when TRALALERO TRALALA won a dance-off?" },
        answers: { da: ["Han blev konge", "Internettet crashede i 3 timer", "Han fik en pris", "Ingenting særligt"], en: ["He became king", "The internet crashed for 3 hours", "He got a prize", "Nothing special"] },
        correct: 1
    },
    {
        question: { da: "Hvad er CHIMPANZINI BANANINIs DNA-sammensætning?", en: "What is CHIMPANZINI BANANINI's DNA composition?" },
        answers: { da: ["50% abe, 50% banan", "70% banan, 30% meme-energi", "100% chimpanse", "60% frugt, 40% dyr"], en: ["50% ape, 50% banana", "70% banana, 30% meme energy", "100% chimpanzee", "60% fruit, 40% animal"] },
        correct: 1
    },
    {
        question: { da: "Hvad er TRALALERO TRALALAs hemmelige kostplan?", en: "What is TRALALERO TRALALA's secret diet?" },
        answers: { da: ["Han spiser kun fisk", "Han er faktisk vegetar!", "Han spiser kun kød", "Han spiser alt"], en: ["He only eats fish", "He's actually vegetarian!", "He only eats meat", "He eats everything"] },
        correct: 1
    }
];

function getQuestionText(q) {
    const lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'da';
    if (typeof q.question === 'string') return q.question;
    return q.question[lang] || q.question['da'];
}

function getAnswers(q) {
    const lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'da';
    if (Array.isArray(q.answers)) return q.answers;
    return q.answers[lang] || q.answers['da'];
}

// ===== MAIN FUNCTIONS =====

function startJeopardy() {
    console.log('🧠 Starting Brain Meltdown!');
    
    JeopardyState.active = true;
    JeopardyState.currentQuestion = 0;
    JeopardyState.score = 0;
    JeopardyState.totalBrainCells = 0;  // Reset total
    JeopardyState.currentPotential = 0;  // Reset potential
    JeopardyState.lifelines = { 
        brainBoost: true, 
        crowdChaos: true, 
        callARot: true,
        giveMe2: true 
    };
    JeopardyState.questions = shuffleArray([...JEOPARDY_QUESTIONS]).slice(0, 15);
    JeopardyState.selectedAnswer = null;
    JeopardyState.isAnswerLocked = false;
    JeopardyState.timeLeft = 10;
    JeopardyState.timerPaused = false;
    JeopardyState.baseTime = DEFAULT_TIME;
    
    document.getElementById('game-mode-selection').style.display = 'none';
    
    showJeopardyUI();
    showQuestion();
}

function showJeopardyUI() {
    const existing = document.getElementById('jeopardy-container');
    if (existing) existing.remove();
    
    const container = document.createElement('div');
    container.id = 'jeopardy-container';
    container.className = 'jeopardy-container meltdown-theme';
    container.innerHTML = `
        <div class="jeopardy-overlay"></div>
        <div class="jeopardy-game meltdown-game">
            <button class="jeopardy-close" onclick="exitJeopardy()">✕</button>
            
            <div class="jeopardy-header meltdown-header">
                <h1>${getMeltdownText('title')}</h1>
                <p class="meltdown-subtitle">${getMeltdownText('subtitle')}</p>
                <div class="jeopardy-progress">
                    <span id="jeopardy-question-num">${getMeltdownText('question')} 1/15</span>
                </div>
            </div>
            
            <!-- SCORE DISPLAY -->
            <div class="meltdown-score-display">
                <div class="score-total">
                    <span class="score-label">🧠 TOTAL:</span>
                    <span class="score-value" id="total-cells">0</span>
                </div>
                <div class="score-potential">
                    <span class="score-label">⚡ NU:</span>
                    <span class="score-value counting" id="potential-cells">0</span>
                </div>
            </div>
            
            <!-- TIMER BAR -->
            <div class="meltdown-timer" id="meltdown-timer">
                <div class="timer-bar-container">
                    <div class="timer-bar" id="timer-bar"></div>
                </div>
                <span class="timer-text" id="timer-text">10 ${getMeltdownText('seconds')}</span>
            </div>
            
            <div class="jeopardy-lifelines meltdown-lifelines">
                <button id="lifeline-5050" class="lifeline-btn meltdown-lifeline" onclick="useFiftyFifty()">
                    <span class="lifeline-icon">🧠</span>
                    <span class="lifeline-text">${getMeltdownText('brainBoost')}</span>
                </button>
                <button id="lifeline-audience" class="lifeline-btn meltdown-lifeline" onclick="useAskAudience()">
                    <span class="lifeline-icon">👥</span>
                    <span class="lifeline-text">${getMeltdownText('crowdChaos')}</span>
                </button>
                <button id="lifeline-phone" class="lifeline-btn meltdown-lifeline" onclick="usePhoneAFriend()">
                    <span class="lifeline-icon">📞</span>
                    <span class="lifeline-text">${getMeltdownText('callARot')}</span>
                </button>
                <button id="lifeline-time" class="lifeline-btn meltdown-lifeline time-lifeline" onclick="useGiveMe2()">
                    <span class="lifeline-icon">⏰</span>
                    <span class="lifeline-text">${getMeltdownText('giveMe2')}</span>
                </button>
            </div>
            
            <div class="jeopardy-question-area">
                <div id="jeopardy-question" class="jeopardy-question"></div>
            </div>
            
            <div id="jeopardy-answers" class="jeopardy-answers"></div>
            
            <div id="jeopardy-actions" class="jeopardy-actions">
                <button id="jeopardy-lock-btn" class="jeopardy-lock-btn meltdown-lock" onclick="lockAnswer()" disabled>
                    ${getMeltdownText('lock')}
                </button>
            </div>
            
            <div class="jeopardy-prize-ladder meltdown-ladder" id="jeopardy-ladder"></div>
        </div>
    `;
    
    document.body.appendChild(container);
    generateBrainLadder();
}

function generateBrainLadder() {
    const ladder = document.getElementById('jeopardy-ladder');
    let html = `<div class="ladder-title">${getMeltdownText('brainLadder')}</div>`;
    
    for (let i = BRAIN_CELL_LADDER.length - 1; i >= 0; i--) {
        const isCheckpoint = BRAIN_CHECKPOINTS.includes(i);
        const isCurrent = i === JeopardyState.currentQuestion;
        const tier = i < 5 ? 'smooth' : (i < 10 ? 'wrinkly' : 'galaxy');
        html += `
            <div class="ladder-step ${isCheckpoint ? 'checkpoint' : ''} ${isCurrent ? 'current' : ''} tier-${tier}" id="ladder-${i}">
                <span class="ladder-num">${i + 1}</span>
                <span class="ladder-prize">${formatBrainCells(BRAIN_CELL_LADDER[i])}</span>
                ${isCheckpoint ? '<span class="checkpoint-flag">🚩</span>' : ''}
            </div>
        `;
    }
    
    ladder.innerHTML = html;
}

// Beholdt for backward compatibility
function formatPrize(amount) {
    return formatBrainCells(amount);
}

function formatBrainCells(amount) {
    if (amount >= 1000000) return '1M 🧠';
    if (amount >= 1000) return (amount / 1000) + 'K 🧠';
    return amount + ' 🧠';
}

// ===== TIMER SYSTEM =====
const DEFAULT_TIME = 10; // 10 sekunder per spørgsmål

function startTimer() {
    stopTimer();
    JeopardyState.timeLeft = JeopardyState.baseTime;
    JeopardyState.timerPaused = false;
    
    // Sæt potentielle hjerneceller til max for dette niveau
    const maxCells = BRAIN_CELL_LADDER[JeopardyState.currentQuestion];
    JeopardyState.currentPotential = maxCells;
    
    updateTimerDisplay();
    updatePotentialDisplay();
    
    JeopardyState.timerInterval = setInterval(() => {
        if (JeopardyState.timerPaused) return;
        
        JeopardyState.timeLeft -= 0.1;
        
        // Beregn potentielle celler baseret på tid tilbage (procent af max)
        const timePercent = JeopardyState.timeLeft / JeopardyState.baseTime;
        JeopardyState.currentPotential = Math.floor(maxCells * timePercent);
        
        updateTimerDisplay();
        updatePotentialDisplay();
        
        if (JeopardyState.timeLeft <= 0) {
            JeopardyState.currentPotential = 0;
            stopTimer();
            timeUp();
        }
    }, 100);
}

function stopTimer() {
    if (JeopardyState.timerInterval) {
        clearInterval(JeopardyState.timerInterval);
        JeopardyState.timerInterval = null;
    }
}

function pauseTimer() {
    JeopardyState.timerPaused = true;
}

function resumeTimer() {
    JeopardyState.timerPaused = false;
}

function updateTimerDisplay() {
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    if (!timerBar || !timerText) return;
    
    const percent = (JeopardyState.timeLeft / JeopardyState.baseTime) * 100;
    timerBar.style.width = percent + '%';
    
    if (percent > 50) {
        timerBar.style.background = 'linear-gradient(90deg, #00ff00, #88ff00)';
        timerBar.classList.remove('danger');
    } else if (percent > 25) {
        timerBar.style.background = 'linear-gradient(90deg, #ffff00, #ff8800)';
        timerBar.classList.remove('danger');
    } else {
        timerBar.style.background = 'linear-gradient(90deg, #ff4400, #ff0000)';
        timerBar.classList.add('danger');
    }
    
    timerText.textContent = Math.ceil(JeopardyState.timeLeft) + ' ' + getMeltdownText('seconds');
}

function updatePotentialDisplay() {
    const prizeEl = document.getElementById('jeopardy-prize');
    const potentialEl = document.getElementById('potential-cells');
    
    if (potentialEl) {
        potentialEl.textContent = formatBrainCells(JeopardyState.currentPotential);
        // Farve baseret på hvor meget der er tilbage
        const maxCells = BRAIN_CELL_LADDER[JeopardyState.currentQuestion];
        const percent = (JeopardyState.currentPotential / maxCells) * 100;
        if (percent > 50) {
            potentialEl.style.color = '#00ff00';
        } else if (percent > 25) {
            potentialEl.style.color = '#ffff00';
        } else {
            potentialEl.style.color = '#ff4444';
        }
    }
}

function updateTotalDisplay() {
    const totalEl = document.getElementById('total-cells');
    if (totalEl) {
        totalEl.textContent = JeopardyState.totalBrainCells.toLocaleString();
        // Pulse animation
        totalEl.classList.add('pulse');
        setTimeout(() => totalEl.classList.remove('pulse'), 500);
    }
}

function showCellsEarned(amount) {
    const container = document.getElementById('jeopardy-container');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.className = 'cells-earned-popup';
    popup.innerHTML = `+${amount.toLocaleString()} 🧠`;
    container.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1500);
}

function timeUp() {
    JeopardyState.isAnswerLocked = true;
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(150, 0.5, 'sawtooth', 0.4);
    }
    showMeltdown(true);
}

// ===== LIFELINE: GIV MIG 2! =====
function useGiveMe2() {
    if (!JeopardyState.lifelines.giveMe2 || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.lifelines.giveMe2 = false;
    const btn = document.getElementById('lifeline-time');
    if (btn) {
        btn.classList.add('used');
        btn.disabled = true;
    }
    
    // Tilføj 2 minutter (120 sek) KUN til dette spørgsmål
    JeopardyState.timeLeft += 120;
    JeopardyState.baseTime = JeopardyState.timeLeft; // Opdater for korrekt progress bar
    
    const popup = document.createElement('div');
    popup.className = 'time-bonus-popup';
    popup.innerHTML = `<span>⏰ ${getMeltdownText('extraTime')}</span>`;
    document.getElementById('jeopardy-container')?.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
    
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(800, 0.2, 'sine', 0.3);
        setTimeout(() => AudioSystem.playTone(1000, 0.2, 'sine', 0.3), 150);
    }
    
    updateTimerDisplay();
}

function showMeltdown(isTimeout = false) {
    stopTimer();
    
    const finalScore = JeopardyState.totalBrainCells;
    const message = isTimeout ? getMeltdownText('timeUp') : getMeltdownText('wrongAnswer');
    
    // Gem score
    saveMeltdownScore(finalScore, JeopardyState.currentQuestion + 1, false);
    
    // PLAY JUMPSCARE SOUND! 🎵
    playJumpscare();
    
    const popup = document.createElement('div');
    popup.className = 'meltdown-popup';
    popup.innerHTML = `
        <div class="meltdown-content">
            <h1>${getMeltdownText('meltdown')}</h1>
            <div class="meltdown-brain">🧠💥</div>
            <p class="meltdown-message">${message}</p>
            <div class="result-score">
                <span class="score-label">🧠 ${getMeltdownText('youCollected')}:</span>
                <span class="score-final">${finalScore.toLocaleString()}</span>
            </div>
            <p style="color: #888;">${getMeltdownText('question')} ${JeopardyState.currentQuestion + 1}/15</p>
            <div class="result-buttons">
                <button class="meltdown-btn" onclick="restartMeltdown()">
                    ${getMeltdownText('playAgain')}
                </button>
                <button class="scoreboard-btn" onclick="showMeltdownScoreboard()">
                    🏆 Scoreboard
                </button>
            </div>
        </div>
    `;
    document.getElementById('jeopardy-container')?.appendChild(popup);
    
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(100, 0.8, 'sawtooth', 0.5);
    }
}

function getCheckpointCells() {
    for (let i = BRAIN_CHECKPOINTS.length - 1; i >= 0; i--) {
        if (JeopardyState.currentQuestion > BRAIN_CHECKPOINTS[i]) {
            return BRAIN_CELL_LADDER[BRAIN_CHECKPOINTS[i]];
        }
    }
    return 0;
}

function restartMeltdown() {
    document.querySelector('.meltdown-popup')?.remove();
    startJeopardy();
}

function showQuestion() {
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    if (!q) {
        winJeopardy();
        return;
    }
    
    JeopardyState.selectedAnswer = null;
    JeopardyState.isAnswerLocked = false;
    JeopardyState.baseTime = DEFAULT_TIME; // Reset til 10 sekunder per spørgsmål
    
    // Opdater header
    document.getElementById('jeopardy-question-num').textContent = 
        `${getMeltdownText('question')} ${JeopardyState.currentQuestion + 1}/15`;
    
    // Opdater total display
    updateTotalDisplay();
    
    document.getElementById('jeopardy-question').textContent = getQuestionText(q);
    
    const answersDiv = document.getElementById('jeopardy-answers');
    const letters = ['A', 'B', 'C', 'D'];
    const answers = getAnswers(q);
    answersDiv.innerHTML = answers.map((answer, i) => `
        <button class="jeopardy-answer" data-index="${i}" onclick="selectAnswer(${i})">
            <span class="answer-letter">${letters[i]}</span>
            <span class="answer-text">${answer}</span>
        </button>
    `).join('');
    
    document.getElementById('jeopardy-lock-btn').disabled = true;
    document.getElementById('jeopardy-lock-btn').textContent = getMeltdownText('lock');
    
    updateLadder();
    
    // Start timer!
    startTimer();
}

function selectAnswer(index) {
    if (JeopardyState.isAnswerLocked) return;
    
    JeopardyState.selectedAnswer = index;
    
    document.querySelectorAll('.jeopardy-answer').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });
    
    document.getElementById('jeopardy-lock-btn').disabled = false;
    
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(400, 0.1, 'sine', 0.2);
    }
}

// Psykologiske tricks - vælg tilfældig besked
function getRandomPsychTrick() {
    const tricks = [
        'areYouSure',
        'finalAnswer', 
        'thinkAboutIt',
        'bigMoney',
        'loseItAll',
        'stillTime',
        'interestingChoice',
        'mostPeopleWouldnt',
        'youLookNervous',
        'trustYourGut'
    ];
    
    // Tilføj kontekst-specifikke tricks
    if (!JeopardyState.lifelines.askAudience) {
        tricks.push('audienceWrong');
    }
    if (!JeopardyState.lifelines.phoneAFriend) {
        tricks.push('friendWrong');
    }
    
    return tricks[Math.floor(Math.random() * tricks.length)];
}

function lockAnswer() {
    if (JeopardyState.selectedAnswer === null || JeopardyState.isAnswerLocked) return;
    
    // 60% chance for "Er du sikker?" dialog (højere chance ved senere spørgsmål)
    const psychChance = 0.4 + (JeopardyState.currentQuestion * 0.04); // 40% -> 96%
    
    if (Math.random() < psychChance && JeopardyState.currentQuestion >= 2) {
        showAreYouSureDialog();
        return;
    }
    
    confirmLockAnswer();
}

function showAreYouSureDialog() {
    const letters = ['A', 'B', 'C', 'D'];
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const answers = getAnswers(q);
    const selectedAnswer = answers[JeopardyState.selectedAnswer];
    const selectedLetter = letters[JeopardyState.selectedAnswer];
    const trickKey = getRandomPsychTrick();
    const currentPrize = JeopardyState.currentQuestion > 0 ? formatBrainCells(BRAIN_CELL_LADDER[JeopardyState.currentQuestion - 1]) : '0 kr';
    const nextPrize = formatBrainCells(BRAIN_CELL_LADDER[JeopardyState.currentQuestion]);
    
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup psych-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content psych-content">
            <div class="psych-emoji">🎩</div>
            <h2>${getJeopardyText('finalAnswer')}</h2>
            <div class="psych-selected">
                <span class="psych-letter">${selectedLetter}</span>
                <span class="psych-answer">${selectedAnswer}</span>
            </div>
            <p class="psych-trick">${getJeopardyText(trickKey)}</p>
            <p class="psych-stakes">💰 ${currentPrize} → ${nextPrize}</p>
            <div class="psych-buttons">
                <button class="psych-btn confirm-btn" onclick="closePsychAndLock()">
                    ${getJeopardyText('confirm')} ✓
                </button>
                <button class="psych-btn change-btn" onclick="closePsychAndChange()">
                    ${getJeopardyText('changeAnswer')} ✗
                </button>
            </div>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    
    // Dramatisk lyd
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(150, 0.8, 'sine', 0.15);
    }
}

function closePsychAndLock() {
    document.querySelector('.psych-popup')?.remove();
    confirmLockAnswer();
}

function closePsychAndChange() {
    document.querySelector('.psych-popup')?.remove();
    // Spilleren kan nu vælge et nyt svar
}

function confirmLockAnswer() {
    JeopardyState.isAnswerLocked = true;
    stopTimer(); // Stop timer når svar låses
    document.getElementById('jeopardy-lock-btn').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const isCorrect = JeopardyState.selectedAnswer === q.correct;
    
    const selectedBtn = document.querySelector(`.jeopardy-answer[data-index="${JeopardyState.selectedAnswer}"]`);
    selectedBtn.classList.add('locked');
    
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(200, 0.5, 'sine', 0.1);
    }
    
    setTimeout(() => {
        document.querySelector(`.jeopardy-answer[data-index="${q.correct}"]`).classList.add('correct');
        
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            
            // Tilføj de opnåede hjerneceller til total
            const earnedCells = JeopardyState.currentPotential;
            JeopardyState.totalBrainCells += earnedCells;
            JeopardyState.score = JeopardyState.totalBrainCells;
            
            // Opdater display
            updateTotalDisplay();
            showCellsEarned(earnedCells);
            
            if (typeof AudioSystem !== 'undefined') {
                AudioSystem.playCorrect();
            }
            
            if (JeopardyState.currentQuestion >= 14) {
                setTimeout(() => winJeopardy(), 2000);
            } else {
                // Check if we hit a safe haven - show host dialog
                if (BRAIN_CHECKPOINTS.includes(JeopardyState.currentQuestion)) {
                    setTimeout(() => showHostDialog(), 1500);
                } else {
                    setTimeout(() => {
                        JeopardyState.currentQuestion++;
                        showQuestion();
                    }, 2000);
                }
            }
        } else {
            selectedBtn.classList.add('wrong');
            
            if (typeof AudioSystem !== 'undefined') {
                AudioSystem.playWrong();
            }
            
            setTimeout(() => showMeltdown(false), 2000);
        }
    }, 1500);
}

function showHostDialog() {
    const currentPrize = formatBrainCells(BRAIN_CELL_LADDER[JeopardyState.currentQuestion]);
    const nextQuestion = JeopardyState.currentQuestion + 2;
    
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup host-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content host-content">
            <div class="host-emoji">🎩</div>
            <h2>${getJeopardyText('hostAsk')}</h2>
            <p class="host-message">${getJeopardyText('safeHavenReached')}</p>
            <p class="host-prize">💰 ${currentPrize} 💰</p>
            <p class="host-question">${getJeopardyText('hostMessage').replace('{prize}', currentPrize)}</p>
            <div class="host-buttons">
                <button class="host-btn stop-btn" onclick="walkAway()">
                    ${getJeopardyText('stopHere')} 💰
                </button>
                <button class="host-btn continue-btn" onclick="continueAfterSafeHaven()">
                    ${getJeopardyText('continueGame')} 🎯
                </button>
            </div>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
}

function walkAway() {
    // Remove host popup
    document.querySelector('.host-popup')?.remove();
    
    const finalPrize = BRAIN_CELL_LADDER[JeopardyState.currentQuestion];
    
    const popup = document.createElement('div');
    popup.className = 'jeopardy-result-popup walkaway';
    popup.innerHTML = `
        <div class="result-content">
            <h1>🎉 ${getJeopardyText('walkAway').toUpperCase()}! 🎉</h1>
            <p class="result-subtitle">${getJeopardyText('youWon')}:</p>
            <div class="result-prize">💰 ${formatPrize(finalPrize)} 💰</div>
            <div class="result-emoji">🧠💵🇮🇹</div>
            <button onclick="restartJeopardy()">${getJeopardyText('playAgain')}</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    createConfetti();
}

function continueAfterSafeHaven() {
    document.querySelector('.host-popup')?.remove();
    JeopardyState.currentQuestion++;
    showQuestion();
}

function updateLadder() {
    for (let i = 0; i < BRAIN_CELL_LADDER.length; i++) {
        const step = document.getElementById(`ladder-${i}`);
        if (step) {
            step.classList.remove('current', 'passed');
            if (i === JeopardyState.currentQuestion) {
                step.classList.add('current');
            } else if (i < JeopardyState.currentQuestion) {
                step.classList.add('passed');
            }
        }
    }
}

// ===== LIFELINES =====

function useFiftyFifty() {
    if (!JeopardyState.lifelines.brainBoost || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.lifelines.brainBoost = false;
    document.getElementById('lifeline-5050').classList.add('used');
    document.getElementById('lifeline-5050').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== q.correct);
    const toRemove = shuffleArray(wrongAnswers).slice(0, 2);
    
    toRemove.forEach(i => {
        const btn = document.querySelector(`.jeopardy-answer[data-index="${i}"]`);
        btn.classList.add('eliminated');
        btn.disabled = true;
    });
    
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(600, 0.2, 'sine', 0.3);
    }
}

function useAskAudience() {
    if (!JeopardyState.lifelines.crowdChaos || JeopardyState.isAnswerLocked) return;
    pauseTimer(); // Pause timer under lifeline
    
    JeopardyState.lifelines.crowdChaos = false;
    document.getElementById('lifeline-audience').classList.add('used');
    document.getElementById('lifeline-audience').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    
    const correctPercent = 50 + Math.floor(Math.random() * 21);
    let remaining = 100 - correctPercent;
    const percentages = [0, 0, 0, 0];
    percentages[q.correct] = correctPercent;
    
    const wrongIndexes = [0, 1, 2, 3].filter(i => i !== q.correct);
    wrongIndexes.forEach((i, idx) => {
        if (idx === wrongIndexes.length - 1) {
            percentages[i] = remaining;
        } else {
            const p = Math.floor(Math.random() * (remaining / 2));
            percentages[i] = p;
            remaining -= p;
        }
    });
    
    showAudienceResults(percentages);
}

function showAudienceResults(percentages) {
    const letters = ['A', 'B', 'C', 'D'];
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content audience-content">
            <h2>${getMeltdownText('crowdSays')}</h2>
            <div class="audience-chart">
                ${percentages.map((p, i) => `
                    <div class="audience-bar-wrapper">
                        <div class="audience-percent-top">${p}%</div>
                        <div class="audience-bar-bg">
                            <div class="audience-bar-fill" style="height: 0%" data-height="${p}"></div>
                        </div>
                        <div class="audience-letter-bottom">${letters[i]}</div>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove(); resumeTimer();">${getMeltdownText('ok')}</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    
    // Animate bars
    setTimeout(() => {
        popup.querySelectorAll('.audience-bar-fill').forEach(bar => {
            bar.style.height = bar.dataset.height + '%';
        });
    }, 100);
}

function usePhoneAFriend() {
    if (!JeopardyState.lifelines.callARot || JeopardyState.isAnswerLocked) return;
    pauseTimer(); // Pause timer under lifeline
    
    // Vis Rot-vælger dialog
    showFriendSelector();
}

function showFriendSelector() {
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup friend-selector-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content friend-selector-content">
            <h2>📞 ${getMeltdownText('chooseRot')}</h2>
            <div class="friend-grid">
                ${BRAINROT_FRIENDS.map((friend, index) => {
                    const img = getFriendImage(friend.name);
                    return `
                        <div class="friend-option" onclick="selectFriend(${index})">
                            <div class="friend-image-container">
                                ${img ? `<img src="${img}" alt="${friend.name}" class="friend-image">` : `<span class="friend-emoji-large">${friend.emoji}</span>`}
                            </div>
                            <div class="friend-name">${friend.name}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="cancel-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
}

function selectFriend(friendIndex) {
    // Fjern vælger
    document.querySelector('.friend-selector-popup')?.remove();
    
    // Marker lifeline som brugt
    JeopardyState.lifelines.callARot = false;
    document.getElementById('lifeline-phone').classList.add('used');
    document.getElementById('lifeline-phone').disabled = true;
    
    const friend = BRAINROT_FRIENDS[friendIndex];
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const letters = ['A', 'B', 'C', 'D'];
    const lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'da';
    const answers = getAnswers(q);
    
    // 70% chance for korrekt svar
    const isCorrect = Math.random() < 0.7;
    let answerIndex, confidence, hesitation;
    
    if (isCorrect) {
        answerIndex = q.correct;
        confidence = "";
        hesitation = "";
    } else {
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== q.correct);
        answerIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        confidence = getMeltdownText('notSure');
        hesitation = `${getMeltdownText('maybeBe')} ${letters[q.correct]}? ${getMeltdownText('noNo')} `;
    }
    
    const answer = answers[answerIndex];
    const catchphrase = friend.catchphrase[lang] || friend.catchphrase['da'];
    
    showPhoneCall(friend, letters[answerIndex], answer, confidence, hesitation, catchphrase);
}

function showPhoneCall(friend, letter, answer, confidence, hesitation, catchphrase) {
    const friendImg = getFriendImage(friend.name);
    
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup phone-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content phone-call-content">
            <div class="phone-header">
                <span class="phone-emoji">📞</span>
                <h2>${getMeltdownText('callingRot')} ${friend.name}...</h2>
            </div>
            <div class="phone-friend">
                ${friendImg ? `<img src="${friendImg}" alt="${friend.name}" class="phone-friend-image">` : `<span class="friend-emoji">${friend.emoji}</span>`}
            </div>
            <div class="phone-message">
                <p class="friend-speech">"${catchphrase}..."</p>
                <p class="friend-thinking">${getMeltdownText('thinking')}</p>
                <p class="friend-answer" style="display:none">
                    "${hesitation}<strong>${letter}: ${answer}</strong>!"
                </p>
                <p class="friend-confidence" style="display:none">"${confidence}"</p>
            </div>
            <button class="phone-close" style="display:none" onclick="this.parentElement.parentElement.remove(); resumeTimer();">
                ${getMeltdownText('thanksForHelp')}
            </button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    
    // Spil ring-lyd
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(440, 0.3, 'sine', 0.2);
        setTimeout(() => AudioSystem.playTone(440, 0.3, 'sine', 0.2), 400);
    }
    
    setTimeout(() => {
        popup.querySelector('.friend-thinking').style.display = 'none';
        popup.querySelector('.friend-answer').style.display = 'block';
    }, 2500);
    
    setTimeout(() => {
        if (confidence) {
            popup.querySelector('.friend-confidence').style.display = 'block';
        }
        popup.querySelector('.phone-close').style.display = 'block';
    }, 3500);
}

// ===== WIN/LOSE =====

function winJeopardy() {
    stopTimer();
    
    // Tilføj sidste spørgsmåls celler til total
    JeopardyState.totalBrainCells += JeopardyState.currentPotential;
    const finalScore = JeopardyState.totalBrainCells;
    
    // Gem score
    saveMeltdownScore(finalScore, 15, true);
    
    const popup = document.createElement('div');
    popup.className = 'jeopardy-result-popup win meltdown-result galaxy-brain';
    popup.innerHTML = `
        <div class="result-content">
            <h1>🌟 ${getMeltdownText('congrats')} 🌟</h1>
            <p class="result-subtitle">${getMeltdownText('youAreGalaxyBrain')}</p>
            <div class="result-score galaxy">
                <span class="score-label">🧠 TOTAL:</span>
                <span class="score-final">${finalScore.toLocaleString()}</span>
            </div>
            <div class="result-emoji">🧠🏆🌌</div>
            <div class="result-buttons">
                <button onclick="restartJeopardy()">${getMeltdownText('playAgain')}</button>
                <button onclick="showMeltdownScoreboard()" class="scoreboard-btn">🏆 Scoreboard</button>
            </div>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    createConfetti();
}

function loseJeopardy(isTimeout = false) {
    stopTimer();
    const finalScore = JeopardyState.totalBrainCells;
    
    // Gem score
    saveMeltdownScore(finalScore, JeopardyState.currentQuestion + 1);
    
    const popup = document.createElement('div');
    popup.className = 'jeopardy-result-popup lose meltdown-result';
    popup.innerHTML = `
        <div class="result-content">
            <h1>💥 ${getMeltdownText('meltdown')} 💥</h1>
            <p class="result-subtitle">${isTimeout ? getMeltdownText('timeUp') : getMeltdownText('wrongAnswer')}</p>
            <div class="result-score">
                <span class="score-label">🧠 ${getMeltdownText('youCollected')}:</span>
                <span class="score-final">${finalScore.toLocaleString()}</span>
            </div>
            <p>${getMeltdownText('question')} ${JeopardyState.currentQuestion + 1}/15</p>
            <div class="result-buttons">
                <button onclick="restartJeopardy()">${getMeltdownText('playAgain')}</button>
                <button onclick="showMeltdownScoreboard()" class="scoreboard-btn">🏆 Scoreboard</button>
            </div>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
}

function restartJeopardy() {
    exitJeopardy();
    setTimeout(() => startJeopardy(), 100);
}

function exitJeopardy() {
    JeopardyState.active = false;
    stopTimer(); // Stop timer
    const container = document.getElementById('jeopardy-container');
    if (container) container.remove();
}

// ===== UTILITIES =====

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.backgroundColor = ['#ff10f0', '#00ffff', '#ffff00', '#ff6600', '#00ff00'][Math.floor(Math.random() * 5)];
        document.getElementById('jeopardy-container').appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

// ===== SCOREBOARD SYSTEM =====
const MELTDOWN_STORAGE_KEY = 'brainMeltdownScores';

function getLocalScores() {
    try {
        const data = localStorage.getItem(MELTDOWN_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalScore(score, level, isWin = false) {
    const scores = getLocalScores();
    const playerName = localStorage.getItem('playerName') || 'Anonymous';
    
    scores.push({
        name: playerName,
        score: score,
        level: level,
        isWin: isWin,
        date: new Date().toISOString()
    });
    
    // Sorter og behold top 10
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    
    localStorage.setItem(MELTDOWN_STORAGE_KEY, JSON.stringify(top10));
    return top10;
}

async function saveMeltdownScore(score, level, isWin = false) {
    // Gem lokalt
    saveLocalScore(score, level, isWin);
    
    // Gem til Firebase hvis tilgængelig
    if (typeof firebase !== 'undefined' && firebase.database) {
        try {
            const playerName = localStorage.getItem('playerName') || 'Anonymous';
            await firebase.database().ref('meltdown-scores').push({
                name: playerName,
                score: score,
                level: level,
                isWin: isWin,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            console.log('💾 Score saved to Firebase!');
        } catch (e) {
            console.warn('Could not save to Firebase:', e);
        }
    }
}

async function getGlobalScores() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        return [];
    }
    
    try {
        const snapshot = await firebase.database()
            .ref('meltdown-scores')
            .orderByChild('score')
            .limitToLast(10)
            .once('value');
        
        const scores = [];
        snapshot.forEach(child => {
            scores.push(child.val());
        });
        
        return scores.reverse(); // Højeste først
    } catch (e) {
        console.warn('Could not fetch global scores:', e);
        return [];
    }
}

async function showMeltdownScoreboard() {
    const localScores = getLocalScores();
    const globalScores = await getGlobalScores();
    
    // Fjern eksisterende popup
    document.querySelector('.meltdown-scoreboard')?.remove();
    
    const popup = document.createElement('div');
    popup.className = 'meltdown-scoreboard';
    popup.innerHTML = `
        <div class="scoreboard-overlay" onclick="closeMeltdownScoreboard()"></div>
        <div class="scoreboard-content">
            <button class="scoreboard-close" onclick="closeMeltdownScoreboard()">✕</button>
            <h1>🏆 BRAIN MELTDOWN SCOREBOARD 🏆</h1>
            
            <div class="scoreboard-tabs">
                <button class="tab-btn active" onclick="switchScoreboardTab('local')">🏠 Lokal</button>
                <button class="tab-btn" onclick="switchScoreboardTab('global')">🌍 Global</button>
            </div>
            
            <div class="scoreboard-table" id="scoreboard-local">
                <div class="scoreboard-header">
                    <span>#</span>
                    <span>Navn</span>
                    <span>🧠 Score</span>
                    <span>Level</span>
                </div>
                ${localScores.length === 0 ? '<div class="no-scores">Ingen scores endnu!</div>' : 
                    localScores.map((s, i) => `
                        <div class="scoreboard-row ${s.isWin ? 'winner' : ''} ${i < 3 ? 'top-' + (i+1) : ''}">
                            <span class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                            <span class="name">${s.name}</span>
                            <span class="score">${s.score.toLocaleString()}</span>
                            <span class="level">${s.level}/15 ${s.isWin ? '🌟' : ''}</span>
                        </div>
                    `).join('')
                }
            </div>
            
            <div class="scoreboard-table hidden" id="scoreboard-global">
                <div class="scoreboard-header">
                    <span>#</span>
                    <span>Navn</span>
                    <span>🧠 Score</span>
                    <span>Level</span>
                </div>
                ${globalScores.length === 0 ? '<div class="no-scores">Ingen globale scores endnu!</div>' : 
                    globalScores.map((s, i) => `
                        <div class="scoreboard-row ${s.isWin ? 'winner' : ''} ${i < 3 ? 'top-' + (i+1) : ''}">
                            <span class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                            <span class="name">${s.name}</span>
                            <span class="score">${s.score.toLocaleString()}</span>
                            <span class="level">${s.level}/15 ${s.isWin ? '🌟' : ''}</span>
                        </div>
                    `).join('')
                }
            </div>
            
            <div class="scoreboard-input">
                <label>👤 Dit navn:</label>
                <input type="text" id="player-name-input" 
                       value="${localStorage.getItem('playerName') || ''}" 
                       placeholder="Indtast dit navn..."
                       maxlength="20">
                <button onclick="savePlayerName()">Gem</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function closeMeltdownScoreboard() {
    document.querySelector('.meltdown-scoreboard')?.remove();
}

function switchScoreboardTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.scoreboard-table').forEach(t => t.classList.add('hidden'));
    
    if (tab === 'local') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('scoreboard-local').classList.remove('hidden');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('scoreboard-global').classList.remove('hidden');
    }
}

// ===== JUMPSCARE SOUND =====
function playJumpscare() {
    // Vælg tilfældig jumpscare lyd (38 eller 71)
    const jumpscares = [
        'Sound/38_GYYAAAAAT.mp3',
        'Sound/71_GYAAAAAAAAAT_bass_boosted.mp3'
    ];
    
    const randomJumpscare = jumpscares[Math.floor(Math.random() * jumpscares.length)];
    const jumpscare = new Audio(randomJumpscare);
    jumpscare.volume = 0.8; // Høj volume for jumpscare effekt!
    
    jumpscare.play().catch(e => {
        console.log('Jumpscare failed:', e);
    });
}

function savePlayerName() {
    const input = document.getElementById('player-name-input');
    const name = input.value.trim() || 'Anonymous';
    localStorage.setItem('playerName', name);
    
    // Vis bekræftelse
    input.style.borderColor = '#00ff00';
    setTimeout(() => input.style.borderColor = '', 1000);
}

console.log('🧠💥 Brain Meltdown loaded!');
