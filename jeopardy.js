// ============================================
// BRAINROT JEOPARDY - "Hvem vil være Brainrot Millionær"
// 15 spørgsmål, 3 lifelines, epic gameplay!
// ============================================

'use strict';

// ===== JEOPARDY GAME STATE =====
const JeopardyState = {
    active: false,
    currentQuestion: 0,
    score: 0,
    lifelines: {
        fiftyFifty: true,
        askAudience: true,
        phoneAFriend: true
    },
    questions: [],
    selectedAnswer: null,
    isAnswerLocked: false
};

// ===== PRIZE LADDER (like Millionaire) =====
const PRIZE_LADDER = [
    100, 200, 300, 500, 1000,           // Spørgsmål 1-5
    2000, 4000, 8000, 16000, 32000,     // Spørgsmål 6-10
    64000, 125000, 250000, 500000, 1000000  // Spørgsmål 11-15
];

// Safe havens (guaranteed money)
const SAFE_HAVENS = [4, 9, 14]; // After Q5, Q10, Q15

// ===== BRAINROT FRIENDS (for Phone-a-Friend) =====
const BRAINROT_FRIENDS = [
    { name: "TRALALERO TRALALA", emoji: "🦈", catchphrase: "Tralala! Jeg er ret sikker på det er" },
    { name: "BOMBARDIRO CROCODILO", emoji: "🐊", catchphrase: "BOOM! Mit bomber-instinkt siger" },
    { name: "CAPPUCCINO ASSASSINO", emoji: "☕", catchphrase: "La morte è una tazzina... svaret er" },
    { name: "LIRILI LARILA", emoji: "🐘", catchphrase: "*trompet lyde* Jeg tror det er" },
    { name: "TRIPPI TROPPI", emoji: "🍄", catchphrase: "Woooah dude... i min psykedeliske vision ser jeg" },
    { name: "CHIMPANZINI BANANINI", emoji: "🐵", catchphrase: "OOH OOH AH AH! Banan-hjernen siger" }
];

// ===== 15 QUIZ QUESTIONS (based on descriptions) =====
const JEOPARDY_QUESTIONS = [
    // EASY (1-5)
    {
        question: "Hvilken karakter er en haj med menneskeben?",
        answers: ["TRALALERO TRALALA", "BOMBARDIRO CROCODILO", "CAPPUCCINO ASSASSINO", "LIRILI LARILA"],
        correct: 0,
        image: "tralalero_tralala"
    },
    {
        question: "Hvad er TUNG TUNG TUNG SAHURs hellige job?",
        answers: ["At lave pizza", "At vække folk til Sahur", "At danse ballet", "At flyve bomber"],
        correct: 1,
        image: "tung_tung_tung_sahur"
    },
    {
        question: "Hvad er BALLERINA CAPPUCCINA lavet af?",
        answers: ["Chokolade", "Cappuccino", "Marmor", "Bananer"],
        correct: 1,
        image: "ballerina_cappuccina"
    },
    {
        question: "Hvad er BOMBARDIRO CROCODILO bange for?",
        answers: ["Flyvemaskiner", "Gummiænder", "Krokodiller", "Bomber"],
        correct: 1,
        image: "bombardiro_crocodilo"
    },
    {
        question: "Hvilken karakter er en kaffe-snigmorder?",
        answers: ["BALLERINA CAPPUCCINA", "TRIPPI TROPPI", "CAPPUCCINO ASSASSINO", "LIRILI LARILA"],
        correct: 2,
        image: "cappuccino_assassino"
    },
    
    // MEDIUM (6-10)
    {
        question: "Hvad siger CAPPUCCINO ASSASSINO før han slår til?",
        answers: ["Ciao bella!", "La morte è una tazzina", "Espresso yourself!", "Coffee time!"],
        correct: 1,
        image: "cappuccino_assassino"
    },
    {
        question: "Hvilken karakter kan hypnotisere fjender med dans?",
        answers: ["BRR BRR PATAPIM", "TRALALERO TRALALA", "TUNG TUNG TUNG SAHUR", "BOMBARDIRO CROCODILO"],
        correct: 1,
        image: "tralalero_tralala"
    },
    {
        question: "Hvad er LIRILI LARILAs specielle evne?",
        answers: ["At flyve", "At lave musik med sin snabel", "At spytte ild", "At blive usynlig"],
        correct: 1,
        image: "lirili_larila"
    },
    {
        question: "Hvornår blev BALLERINA CAPPUCCINA født?",
        answers: ["Kl. 12:00", "Kl. 6:47", "Kl. 3:33", "Kl. 9:15"],
        correct: 1,
        image: "ballerina_cappuccina"
    },
    {
        question: "Hvad forårsagede BOMBARDIRO CROCODILO ved et uheld?",
        answers: ["En tsunami", "En is-krise (gelato-stand bombing)", "En jordskælv", "En vulkanudbrud"],
        correct: 1,
        image: "bombardiro_crocodilo"
    },
    
    // HARD (11-15)
    {
        question: "Hvad er TRIPPI TROPPIs oprindelse?",
        answers: ["En vulkan", "En diskokugle + porcini svamp ved 70'er rave", "Et laboratorium", "En regnbue"],
        correct: 1,
        image: "trippi_troppi"
    },
    {
        question: "Hvad er BRR BRR PATAPAMs personlighed?",
        answers: ["Aggressiv og vild", "Overraskende zen og rolig", "Konstant sur", "Ekstremt snakkesalig"],
        correct: 1,
        image: "brr_brr_patapim"
    },
    {
        question: "Hvad skete der da TRALALERO TRALALA vandt en dance-off?",
        answers: ["Han blev konge", "Internettet crashede i 3 timer", "Han fik en pris", "Ingenting særligt"],
        correct: 1,
        image: "tralalero_tralala"
    },
    {
        question: "Hvad er CHIMPANZINI BANANINIs DNA-sammensætning?",
        answers: ["50% abe, 50% banan", "70% banan, 30% meme-energi", "100% chimpanse", "60% frugt, 40% dyr"],
        correct: 1,
        image: "chimpanzini_bananini"
    },
    {
        question: "Hvad er TRALALERO TRALALAs hemmelige kostplan?",
        answers: ["Han spiser kun fisk", "Han er faktisk vegetar!", "Han spiser kun kød", "Han spiser alt"],
        correct: 1,
        image: "tralalero_tralala"
    }
];

// ===== JEOPARDY UI FUNCTIONS =====

function startJeopardy() {
    console.log('🎮 Starting Brainrot Jeopardy!');
    
    // Reset state
    JeopardyState.active = true;
    JeopardyState.currentQuestion = 0;
    JeopardyState.score = 0;
    JeopardyState.lifelines = { fiftyFifty: true, askAudience: true, phoneAFriend: true };
    JeopardyState.questions = shuffleArray([...JEOPARDY_QUESTIONS]).slice(0, 15);
    JeopardyState.selectedAnswer = null;
    JeopardyState.isAnswerLocked = false;
    
    // Hide other UI, show Jeopardy
    document.getElementById('game-mode-selection').style.display = 'none';
    document.getElementById('play-quiz-btn').style.display = 'none';
    
    showJeopardyUI();
    showQuestion();
}

function showJeopardyUI() {
    // Remove existing if any
    const existing = document.getElementById('jeopardy-container');
    if (existing) existing.remove();
    
    const container = document.createElement('div');
    container.id = 'jeopardy-container';
    container.className = 'jeopardy-container';
    container.innerHTML = `
        <div class="jeopardy-overlay"></div>
        <div class="jeopardy-game">
            <button class="jeopardy-close" onclick="exitJeopardy()">✕</button>
            
            <div class="jeopardy-header">
                <h1>🧠 BRAINROT JEOPARDY 🇮🇹</h1>
                <div class="jeopardy-progress">
                    <span id="jeopardy-question-num">Spørgsmål 1/15</span>
                    <span id="jeopardy-prize">💰 0 kr</span>
                </div>
            </div>
            
            <div class="jeopardy-lifelines">
                <button id="lifeline-5050" class="lifeline-btn" onclick="useFiftyFifty()">
                    <span class="lifeline-icon">50:50</span>
                </button>
                <button id="lifeline-audience" class="lifeline-btn" onclick="useAskAudience()">
                    <span class="lifeline-icon">👥</span>
                    <span class="lifeline-text">Spørg Publikum</span>
                </button>
                <button id="lifeline-phone" class="lifeline-btn" onclick="usePhoneAFriend()">
                    <span class="lifeline-icon">📞</span>
                    <span class="lifeline-text">Ring til en Ven</span>
                </button>
            </div>
            
            <div class="jeopardy-question-area">
                <div id="jeopardy-image" class="jeopardy-image"></div>
                <div id="jeopardy-question" class="jeopardy-question"></div>
            </div>
            
            <div id="jeopardy-answers" class="jeopardy-answers">
                <!-- Answers generated dynamically -->
            </div>
            
            <div id="jeopardy-actions" class="jeopardy-actions">
                <button id="jeopardy-lock-btn" class="jeopardy-lock-btn" onclick="lockAnswer()" disabled>
                    🔒 LÅS SVAR
                </button>
            </div>
            
            <div class="jeopardy-prize-ladder" id="jeopardy-ladder">
                <!-- Prize ladder generated dynamically -->
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    generatePrizeLadder();
}

function generatePrizeLadder() {
    const ladder = document.getElementById('jeopardy-ladder');
    let html = '<div class="ladder-title">💎 PRÆMIESTIGE 💎</div>';
    
    for (let i = PRIZE_LADDER.length - 1; i >= 0; i--) {
        const isSafe = SAFE_HAVENS.includes(i);
        const isCurrent = i === JeopardyState.currentQuestion;
        html += `
            <div class="ladder-step ${isSafe ? 'safe' : ''} ${isCurrent ? 'current' : ''}" id="ladder-${i}">
                <span class="ladder-num">${i + 1}</span>
                <span class="ladder-prize">${formatPrize(PRIZE_LADDER[i])}</span>
            </div>
        `;
    }
    
    ladder.innerHTML = html;
}

function formatPrize(amount) {
    return amount.toLocaleString('da-DK') + ' kr';
}

function showQuestion() {
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    if (!q) {
        winJeopardy();
        return;
    }
    
    JeopardyState.selectedAnswer = null;
    JeopardyState.isAnswerLocked = false;
    
    // Update header
    document.getElementById('jeopardy-question-num').textContent = 
        `Spørgsmål ${JeopardyState.currentQuestion + 1}/15`;
    document.getElementById('jeopardy-prize').textContent = 
        `💰 ${formatPrize(JeopardyState.currentQuestion > 0 ? PRIZE_LADDER[JeopardyState.currentQuestion - 1] : 0)}`;
    
    // Show question
    document.getElementById('jeopardy-question').textContent = q.question;
    
    // Show image if available
    const imageDiv = document.getElementById('jeopardy-image');
    if (q.image && typeof CHARACTERS !== 'undefined') {
        const char = CHARACTERS.find(c => c.name.toLowerCase().replace(/ /g, '_') === q.image.toLowerCase());
        if (char) {
            imageDiv.innerHTML = `<img src="${char.image}" alt="?" class="jeopardy-char-img">`;
            imageDiv.style.display = 'block';
        } else {
            imageDiv.style.display = 'none';
        }
    } else {
        imageDiv.style.display = 'none';
    }
    
    // Generate answer buttons
    const answersDiv = document.getElementById('jeopardy-answers');
    const letters = ['A', 'B', 'C', 'D'];
    answersDiv.innerHTML = q.answers.map((answer, i) => `
        <button class="jeopardy-answer" data-index="${i}" onclick="selectAnswer(${i})">
            <span class="answer-letter">${letters[i]}</span>
            <span class="answer-text">${answer}</span>
        </button>
    `).join('');
    
    // Reset lock button
    document.getElementById('jeopardy-lock-btn').disabled = true;
    
    // Update ladder
    updateLadder();
}

function selectAnswer(index) {
    if (JeopardyState.isAnswerLocked) return;
    
    JeopardyState.selectedAnswer = index;
    
    // Update visual selection
    document.querySelectorAll('.jeopardy-answer').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });
    
    // Enable lock button
    document.getElementById('jeopardy-lock-btn').disabled = false;
    
    // Play select sound
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(400, 0.1, 'sine', 0.2);
    }
}

function lockAnswer() {
    if (JeopardyState.selectedAnswer === null || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.isAnswerLocked = true;
    document.getElementById('jeopardy-lock-btn').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const isCorrect = JeopardyState.selectedAnswer === q.correct;
    
    // Dramatic pause then reveal
    const selectedBtn = document.querySelector(`.jeopardy-answer[data-index="${JeopardyState.selectedAnswer}"]`);
    selectedBtn.classList.add('locked');
    
    // Play suspense sound
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.playTone(200, 0.5, 'sine', 0.1);
    }
    
    setTimeout(() => {
        // Show correct answer
        document.querySelector(`.jeopardy-answer[data-index="${q.correct}"]`).classList.add('correct');
        
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            JeopardyState.score = PRIZE_LADDER[JeopardyState.currentQuestion];
            
            if (typeof AudioSystem !== 'undefined') {
                AudioSystem.playCorrect();
            }
            
            // Check if won
            if (JeopardyState.currentQuestion >= 14) {
                setTimeout(() => winJeopardy(), 2000);
            } else {
                setTimeout(() => {
                    JeopardyState.currentQuestion++;
                    showQuestion();
                }, 2000);
            }
        } else {
            selectedBtn.classList.add('wrong');
            
            if (typeof AudioSystem !== 'undefined') {
                AudioSystem.playWrong();
            }
            
            setTimeout(() => loseJeopardy(), 2000);
        }
    }, 1500);
}

function updateLadder() {
    // Update all ladder steps
    for (let i = 0; i < PRIZE_LADDER.length; i++) {
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
    if (!JeopardyState.lifelines.fiftyFifty || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.lifelines.fiftyFifty = false;
    document.getElementById('lifeline-5050').classList.add('used');
    document.getElementById('lifeline-5050').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== q.correct);
    
    // Remove 2 random wrong answers
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
    if (!JeopardyState.lifelines.askAudience || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.lifelines.askAudience = false;
    document.getElementById('lifeline-audience').classList.add('used');
    document.getElementById('lifeline-audience').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    
    // Generate rigged percentages (correct answer gets 50-70%)
    const correctPercent = 50 + Math.floor(Math.random() * 21);
    let remaining = 100 - correctPercent;
    const percentages = [0, 0, 0, 0];
    percentages[q.correct] = correctPercent;
    
    // Distribute remaining among wrong answers
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
    
    // Show audience results popup
    showAudienceResults(percentages);
}

function showAudienceResults(percentages) {
    const letters = ['A', 'B', 'C', 'D'];
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content">
            <h2>👥 PUBLIKUM SIGER:</h2>
            <div class="audience-bars">
                ${percentages.map((p, i) => `
                    <div class="audience-bar-container">
                        <div class="audience-bar" style="height: ${p}%"></div>
                        <span class="audience-percent">${p}%</span>
                        <span class="audience-letter">${letters[i]}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">OK 👍</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
}

function usePhoneAFriend() {
    if (!JeopardyState.lifelines.phoneAFriend || JeopardyState.isAnswerLocked) return;
    
    JeopardyState.lifelines.phoneAFriend = false;
    document.getElementById('lifeline-phone').classList.add('used');
    document.getElementById('lifeline-phone').disabled = true;
    
    const q = JeopardyState.questions[JeopardyState.currentQuestion];
    const friend = BRAINROT_FRIENDS[Math.floor(Math.random() * BRAINROT_FRIENDS.length)];
    const letters = ['A', 'B', 'C', 'D'];
    
    // 70% chance correct, 30% chance wrong with hesitation
    const isCorrect = Math.random() < 0.7;
    let answerIndex, confidence, hesitation;
    
    if (isCorrect) {
        answerIndex = q.correct;
        confidence = "Jeg er ret sikker!";
        hesitation = "";
    } else {
        // Pick a random wrong answer
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== q.correct);
        answerIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        confidence = "...men æææh, jeg er ikke 100% sikker...";
        hesitation = `Måske er det ${letters[q.correct]}? Nej nej, jeg tror det er `;
    }
    
    const answer = q.answers[answerIndex];
    
    // Show phone call popup
    showPhoneCall(friend, letters[answerIndex], answer, confidence, hesitation);
}

function showPhoneCall(friend, letter, answer, confidence, hesitation) {
    const popup = document.createElement('div');
    popup.className = 'lifeline-popup phone-popup';
    popup.innerHTML = `
        <div class="lifeline-popup-content">
            <div class="phone-header">
                <span class="phone-emoji">📞</span>
                <h2>Ringer til ${friend.name}...</h2>
            </div>
            <div class="phone-friend">
                <span class="friend-emoji">${friend.emoji}</span>
            </div>
            <div class="phone-message">
                <p class="friend-speech">"${friend.catchphrase}..."</p>
                <p class="friend-thinking">🤔 *tænker*</p>
                <p class="friend-answer" style="display:none">
                    "${hesitation}<strong>${letter}: ${answer}</strong>!"
                </p>
                <p class="friend-confidence" style="display:none">"${confidence}"</p>
            </div>
            <button class="phone-close" style="display:none" onclick="this.parentElement.parentElement.remove()">
                Tak for hjælpen! 🙏
            </button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    
    // Animate the response
    setTimeout(() => {
        popup.querySelector('.friend-thinking').style.display = 'none';
        popup.querySelector('.friend-answer').style.display = 'block';
    }, 2000);
    
    setTimeout(() => {
        popup.querySelector('.friend-confidence').style.display = 'block';
        popup.querySelector('.phone-close').style.display = 'block';
    }, 3000);
}

// ===== WIN/LOSE =====

function winJeopardy() {
    const popup = document.createElement('div');
    popup.className = 'jeopardy-result-popup win';
    popup.innerHTML = `
        <div class="result-content">
            <h1>🎉 TILLYKKE! 🎉</h1>
            <p class="result-subtitle">DU ER BRAINROT MILLIONÆR!</p>
            <div class="result-prize">💰 ${formatPrize(1000000)} 💰</div>
            <div class="result-emoji">🧠🏆🇮🇹</div>
            <button onclick="exitJeopardy()">SPIL IGEN 🔄</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
    
    // Confetti effect
    createConfetti();
}

function loseJeopardy() {
    // Calculate safe haven prize
    let finalPrize = 0;
    for (let i = SAFE_HAVENS.length - 1; i >= 0; i--) {
        if (JeopardyState.currentQuestion > SAFE_HAVENS[i]) {
            finalPrize = PRIZE_LADDER[SAFE_HAVENS[i]];
            break;
        }
    }
    
    const popup = document.createElement('div');
    popup.className = 'jeopardy-result-popup lose';
    popup.innerHTML = `
        <div class="result-content">
            <h1>💀 GAME OVER 💀</h1>
            <p class="result-subtitle">Det var desværre forkert!</p>
            <div class="result-prize">Du vandt: ${formatPrize(finalPrize)}</div>
            <p>Du nåede spørgsmål ${JeopardyState.currentQuestion + 1}/15</p>
            <button onclick="exitJeopardy()">PRØV IGEN 🔄</button>
        </div>
    `;
    document.getElementById('jeopardy-container').appendChild(popup);
}

function exitJeopardy() {
    JeopardyState.active = false;
    const container = document.getElementById('jeopardy-container');
    if (container) container.remove();
    
    // Show play button again
    const playBtn = document.getElementById('play-quiz-btn');
    if (playBtn) playBtn.style.display = '';
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

console.log('🎮 Brainrot Jeopardy loaded!');
