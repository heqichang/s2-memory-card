const GAME_CONFIG = {
    initialTime: 60,
    totalPairs: 8,
    flipAnimationDuration: 400,
    mismatchResetDelay: 1000,
    confettiCount: 30
};

const EMOJIS = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎵', '🎲'];

const elements = {
    cardGrid: document.getElementById('card-grid'),
    matchedCount: document.getElementById('matched-count'),
    timer: document.getElementById('timer'),
    restartBtn: document.getElementById('restart-btn'),
    cards: document.querySelectorAll('.card'),
    resultModal: document.getElementById('result-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalIcon: document.getElementById('modal-icon'),
    modalRestartBtn: document.getElementById('modal-restart-btn'),
    confettiContainer: document.getElementById('confetti-container')
};

let gameState = {
    flippedCards: [],
    matchedCount: 0,
    isProcessing: false,
    timeLeft: GAME_CONFIG.initialTime,
    timerInterval: null,
    status: 'playing'
};

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function updateMatchedCount(count) {
    elements.matchedCount.textContent = count;
    elements.matchedCount.classList.remove('pulse');
    void elements.matchedCount.offsetWidth;
    elements.matchedCount.classList.add('pulse');
}

function updateTimerDisplay(time) {
    elements.timer.textContent = time;
    if (time <= 10) {
        elements.timer.style.color = '#ef4444';
    } else {
        elements.timer.style.color = '';
    }
}

function startTimer() {
    stopTimer();
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay(gameState.timeLeft);

        if (gameState.timeLeft <= 0) {
            endGame('lost');
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function createConfetti() {
    if (!elements.confettiContainer) return;
    
    elements.confettiContainer.innerHTML = '';
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    
    for (let i = 0; i < GAME_CONFIG.confettiCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        elements.confettiContainer.appendChild(piece);
    }
}

function showResult(status) {
    if (status === 'won') {
        elements.modalIcon.textContent = '🎉';
        elements.modalTitle.textContent = '恭喜你赢了！';
        elements.modalTitle.classList.add('success');
        elements.modalMessage.textContent = `太棒了！你用了 ${GAME_CONFIG.initialTime - gameState.timeLeft} 秒完成游戏！`;
        createConfetti();
    } else {
        elements.modalIcon.textContent = '⏰';
        elements.modalTitle.textContent = '时间到！';
        elements.modalTitle.classList.remove('success');
        elements.modalMessage.textContent = `别灰心，你已经配对了 ${gameState.matchedCount} 对，再试一次吧！`;
    }
    
    elements.resultModal.classList.add('show');
}

function hideResult() {
    elements.resultModal.classList.remove('show');
    if (elements.confettiContainer) {
        elements.confettiContainer.innerHTML = '';
    }
}

function endGame(status) {
    gameState.status = status;
    gameState.isProcessing = true;
    stopTimer();
    showResult(status);
}

function initializeCards() {
    const emojiPairs = [...EMOJIS, ...EMOJIS];
    const shuffledEmojis = shuffleArray(emojiPairs);

    elements.cards.forEach((card, index) => {
        card.classList.remove('flipped', 'matched');
        card.dataset.pairId = shuffledEmojis[index];
        const cardFront = card.querySelector('.card-front');
        cardFront.textContent = shuffledEmojis[index];
    });
}

function resetGameState() {
    gameState.flippedCards = [];
    gameState.matchedCount = 0;
    gameState.isProcessing = false;
    gameState.timeLeft = GAME_CONFIG.initialTime;
    gameState.status = 'playing';
}

function updateUI() {
    updateMatchedCount(0);
    updateTimerDisplay(GAME_CONFIG.initialTime);
}

function initializeGame() {
    stopTimer();
    hideResult();
    resetGameState();
    updateUI();
    initializeCards();
    startTimer();
}

function handleCardClick(e) {
    const card = e.currentTarget;

    if (gameState.status !== 'playing' ||
        gameState.isProcessing ||
        card.classList.contains('flipped') ||
        card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    gameState.isProcessing = true;

    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.dataset.pairId === card2.dataset.pairId;

    if (isMatch) {
        handleMatchSuccess(card1, card2);
    } else {
        handleMatchFailure(card1, card2);
    }
}

function handleMatchSuccess(card1, card2) {
    setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
    }, GAME_CONFIG.flipAnimationDuration / 2);

    gameState.matchedCount++;
    updateMatchedCount(gameState.matchedCount);
    gameState.flippedCards = [];

    if (gameState.matchedCount === GAME_CONFIG.totalPairs) {
        setTimeout(() => {
            endGame('won');
        }, GAME_CONFIG.flipAnimationDuration + 200);
        return;
    }

    gameState.isProcessing = false;
}

function handleMatchFailure(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        gameState.flippedCards = [];
        gameState.isProcessing = false;
    }, GAME_CONFIG.mismatchResetDelay);
}

let isRestarting = false;

function restartGame() {
    if (isRestarting) return;
    
    isRestarting = true;
    initializeGame();
    
    setTimeout(() => {
        isRestarting = false;
    }, 300);
}

elements.cards.forEach(card => {
    card.addEventListener('click', handleCardClick);
});

elements.restartBtn.addEventListener('click', restartGame);
elements.modalRestartBtn.addEventListener('click', restartGame);

initializeGame();
