const DIFFICULTY_CONFIG = {
    easy: { pairs: 4, time: 90, scoreMultiplier: 1, name: '简单' },
    medium: { pairs: 6, time: 60, scoreMultiplier: 1.5, name: '中等' },
    hard: { pairs: 8, time: 45, scoreMultiplier: 2, name: '困难' },
    expert: { pairs: 10, time: 30, scoreMultiplier: 3, name: '专家' }
};

const LEVEL_CONFIG = [
    { level: 1, pairs: 4, time: 90 },
    { level: 2, pairs: 5, time: 80 },
    { level: 3, pairs: 6, time: 70 },
    { level: 4, pairs: 7, time: 60 },
    { level: 5, pairs: 8, time: 55 },
    { level: 6, pairs: 9, time: 50 },
    { level: 7, pairs: 10, time: 45 },
    { level: 8, pairs: 12, time: 40 },
    { level: 9, pairs: 14, time: 35 },
    { level: 10, pairs: 16, time: 30 }
];

const EMOJIS = [
    '🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎵', '🎲',
    '🎸', '🎺', '🎻', '🎹', '🏀', '⚽', '🏈', '🎾',
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝'
];

const GAME_CONFIG = {
    flipAnimationDuration: 400,
    mismatchResetDelay: 1000,
    confettiCount: 30,
    baseMatchScore: 100,
    comboTimeBonus: 3,
    comboScoreMultiplier: 0.5
};

const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    cardGrid: document.getElementById('card-grid'),
    matchedCount: document.getElementById('matched-count'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    combo: document.getElementById('combo'),
    comboItem: document.getElementById('combo-item'),
    level: document.getElementById('level'),
    levelItem: document.getElementById('level-item'),
    comboBonus: document.getElementById('combo-bonus'),
    restartBtn: document.getElementById('restart-btn'),
    backBtn: document.getElementById('back-btn'),
    startBtn: document.getElementById('start-btn'),
    showLeaderboardBtn: document.getElementById('show-leaderboard-btn'),
    resultModal: document.getElementById('result-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalIcon: document.getElementById('modal-icon'),
    modalRestartBtn: document.getElementById('modal-restart-btn'),
    modalBackBtn: document.getElementById('modal-back-btn'),
    modalStats: document.getElementById('modal-stats'),
    confettiContainer: document.getElementById('confetti-container'),
    levelCompleteModal: document.getElementById('level-complete-modal'),
    levelCompleteMessage: document.getElementById('level-complete-message'),
    levelStats: document.getElementById('level-stats'),
    levelConfetti: document.getElementById('level-confetti'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    levelBackBtn: document.getElementById('level-back-btn'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    leaderboardList: document.getElementById('leaderboard-list'),
    closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
    nameInputModal: document.getElementById('name-input-modal'),
    playerNameInput: document.getElementById('player-name'),
    saveNameBtn: document.getElementById('save-name-btn'),
    skipNameBtn: document.getElementById('skip-name-btn'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    difficultySelector: document.getElementById('difficulty-selector'),
    leaderboardTabs: document.querySelectorAll('.leaderboard-tab')
};

let gameState = {
    mode: 'classic',
    difficulty: 'easy',
    currentLevel: 1,
    flippedCards: [],
    matchedCount: 0,
    isProcessing: false,
    timeLeft: 60,
    timerInterval: null,
    status: 'idle',
    score: 0,
    combo: 0,
    totalPairs: 8,
    scoreMultiplier: 1,
    pendingScore: 0,
    pendingTime: 0,
    pendingLevel: 0
};

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getLeaderboard(mode) {
    const key = mode === 'classic' ? 'memoryCardLeaderboard_classic' : 'memoryCardLeaderboard_level';
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveLeaderboard(mode, data) {
    const key = mode === 'classic' ? 'memoryCardLeaderboard_classic' : 'memoryCardLeaderboard_level';
    localStorage.setItem(key, JSON.stringify(data));
}

function checkIsHighScore(mode, score, level) {
    const leaderboard = getLeaderboard(mode);
    if (leaderboard.length < 10) return true;
    
    if (mode === 'classic') {
        return score > leaderboard[leaderboard.length - 1].score;
    } else {
        if (level > leaderboard[leaderboard.length - 1].level) return true;
        if (level === leaderboard[leaderboard.length - 1].level && score > leaderboard[leaderboard.length - 1].score) return true;
        return false;
    }
}

function addToLeaderboard(mode, name, score, time, level, difficulty) {
    const leaderboard = getLeaderboard(mode);
    const entry = {
        name: name || '匿名玩家',
        score,
        time,
        level: level || 1,
        difficulty: difficulty || '',
        date: new Date().toLocaleDateString('zh-CN')
    };
    
    leaderboard.push(entry);
    
    if (mode === 'classic') {
        leaderboard.sort((a, b) => b.score - a.score);
    } else {
        leaderboard.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.score - a.score;
        });
    }
    
    if (leaderboard.length > 10) {
        leaderboard.length = 10;
    }
    
    saveLeaderboard(mode, leaderboard);
    return leaderboard.findIndex(e => e.name === entry.name && e.score === entry.score) + 1;
}

function updateScoreDisplay(score) {
    elements.score.textContent = score;
    elements.score.classList.remove('pulse');
    void elements.score.offsetWidth;
    elements.score.classList.add('pulse');
}

function updateComboDisplay(combo) {
    elements.combo.textContent = combo;
    if (combo >= 2) {
        elements.combo.classList.remove('pulse');
        void elements.combo.offsetWidth;
        elements.combo.classList.add('pulse');
    }
}

function showComboBonus(combo, timeBonus) {
    const bonus = elements.comboBonus;
    bonus.textContent = `${combo}连击! +${timeBonus}秒`;
    bonus.classList.remove('show');
    void bonus.offsetWidth;
    bonus.classList.add('show');
}

function hideComboBonus() {
    elements.comboBonus.classList.remove('show');
    elements.comboBonus.textContent = '';
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

function updateLevelDisplay(level) {
    elements.level.textContent = level;
    elements.level.classList.remove('pulse');
    void elements.level.offsetWidth;
    elements.level.classList.add('pulse');
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

function addTimeBonus(seconds) {
    gameState.timeLeft += seconds;
    updateTimerDisplay(gameState.timeLeft);
}

function createConfetti(container) {
    if (!container) return;
    
    container.innerHTML = '';
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    
    for (let i = 0; i < GAME_CONFIG.confettiCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(piece);
    }
}

function createCards() {
    const pairs = gameState.totalPairs;
    const selectedEmojis = shuffleArray(EMOJIS).slice(0, pairs);
    const emojiPairs = [...selectedEmojis, ...selectedEmojis];
    const shuffledEmojis = shuffleArray(emojiPairs);

    elements.cardGrid.innerHTML = '';

    let cols = 4;
    if (pairs <= 4) cols = 4;
    else if (pairs <= 6) cols = 4;
    else if (pairs <= 8) cols = 4;
    else if (pairs <= 10) cols = 5;
    else if (pairs <= 12) cols = 6;
    else cols = 7;

    elements.cardGrid.className = `card-grid cols-${cols}`;

    for (let i = 0; i < shuffledEmojis.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardId = i;
        card.dataset.pairId = shuffledEmojis[i];
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = shuffledEmojis[i];
        
        card.appendChild(cardBack);
        card.appendChild(cardFront);
        
        card.addEventListener('click', handleCardClick);
        elements.cardGrid.appendChild(card);
    }
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
    gameState.combo++;
    updateComboDisplay(gameState.combo);

    let matchScore = GAME_CONFIG.baseMatchScore * gameState.scoreMultiplier;
    if (gameState.combo >= 2) {
        matchScore = matchScore * (1 + (gameState.combo - 1) * GAME_CONFIG.comboScoreMultiplier);
    }
    matchScore = Math.floor(matchScore);
    gameState.score += matchScore;
    updateScoreDisplay(gameState.score);

    if (gameState.combo >= 2) {
        const timeBonus = GAME_CONFIG.comboTimeBonus + (gameState.combo - 2);
        addTimeBonus(timeBonus);
        showComboBonus(gameState.combo, timeBonus);
    }

    setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
    }, GAME_CONFIG.flipAnimationDuration / 2);

    gameState.matchedCount++;
    updateMatchedCount(gameState.matchedCount);
    gameState.flippedCards = [];

    if (gameState.matchedCount === gameState.totalPairs) {
        setTimeout(() => {
            handleLevelComplete();
        }, GAME_CONFIG.flipAnimationDuration + 200);
        return;
    }

    gameState.isProcessing = false;
}

function handleMatchFailure(card1, card2) {
    gameState.combo = 0;
    updateComboDisplay(0);

    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        gameState.flippedCards = [];
        gameState.isProcessing = false;
    }, GAME_CONFIG.mismatchResetDelay);
}

function handleLevelComplete() {
    stopTimer();
    
    if (gameState.mode === 'level') {
        const timeUsed = LEVEL_CONFIG[gameState.currentLevel - 1].time - gameState.timeLeft;
        const levelScore = gameState.score;
        
        gameState.pendingScore = gameState.score;
        gameState.pendingTime = timeUsed;
        gameState.pendingLevel = gameState.currentLevel;
        
        showLevelComplete(timeUsed, levelScore);
    } else {
        endGame('won');
    }
}

function showLevelComplete(timeUsed, score) {
    gameState.status = 'levelComplete';
    
    elements.levelCompleteMessage.textContent = `恭喜你完成了第 ${gameState.currentLevel} 关！`;
    
    elements.levelStats.innerHTML = `
        <div class="stat-row">
            <span class="stat-label">用时</span>
            <span class="stat-value">${timeUsed} 秒</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">本关得分</span>
            <span class="stat-value">${score} 分</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">最高连击</span>
            <span class="stat-value">${gameState.combo} 连击</span>
        </div>
    `;
    
    createConfetti(elements.levelConfetti);
    elements.levelCompleteModal.classList.add('show');
    
    if (gameState.currentLevel >= LEVEL_CONFIG.length) {
        elements.nextLevelBtn.textContent = '游戏通关！';
        elements.nextLevelBtn.disabled = true;
    } else {
        elements.nextLevelBtn.textContent = '下一关';
        elements.nextLevelBtn.disabled = false;
    }
}

function hideLevelComplete() {
    elements.levelCompleteModal.classList.remove('show');
    if (elements.levelConfetti) {
        elements.levelConfetti.innerHTML = '';
    }
}

function nextLevel() {
    hideLevelComplete();
    
    if (gameState.currentLevel >= LEVEL_CONFIG.length) {
        endGame('won');
        return;
    }
    
    gameState.currentLevel++;
    updateLevelDisplay(gameState.currentLevel);
    
    const levelData = LEVEL_CONFIG[gameState.currentLevel - 1];
    gameState.totalPairs = levelData.pairs;
    gameState.timeLeft = levelData.time;
    gameState.matchedCount = 0;
    gameState.flippedCards = [];
    gameState.isProcessing = false;
    gameState.combo = 0;
    gameState.status = 'playing';
    
    updateMatchedCount(0);
    updateTimerDisplay(gameState.timeLeft);
    updateComboDisplay(0);
    createCards();
    startTimer();
}

function showResult(status) {
    let timeUsed;
    if (gameState.mode === 'classic') {
        timeUsed = DIFFICULTY_CONFIG[gameState.difficulty].time - gameState.timeLeft;
    } else {
        if (status === 'won') {
            timeUsed = gameState.pendingTime || 0;
        } else {
            timeUsed = LEVEL_CONFIG[gameState.currentLevel - 1].time - gameState.timeLeft;
        }
    }
    
    if (status === 'won') {
        elements.modalIcon.textContent = gameState.mode === 'level' ? '🏆' : '🎉';
        elements.modalTitle.textContent = gameState.mode === 'level' ? '恭喜通关！' : '恭喜你赢了！';
        elements.modalTitle.classList.add('success');
        elements.modalMessage.textContent = gameState.mode === 'level' 
            ? `太棒了！你成功通关了所有关卡！`
            : `太棒了！你用了 ${timeUsed} 秒完成游戏！`;
        createConfetti(elements.confettiContainer);
    } else {
        elements.modalIcon.textContent = '⏰';
        elements.modalTitle.textContent = '时间到！';
        elements.modalTitle.classList.remove('success');
        elements.modalMessage.textContent = `别灰心，你已经配对了 ${gameState.matchedCount} 对，再试一次吧！`;
    }
    
    let statsHtml = `
        <div class="stat-row">
            <span class="stat-label">最终得分</span>
            <span class="stat-value">${gameState.score} 分</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">配对数量</span>
            <span class="stat-value">${gameState.matchedCount} / ${gameState.totalPairs}</span>
        </div>
    `;
    
    if (gameState.mode === 'classic') {
        statsHtml += `
            <div class="stat-row">
                <span class="stat-label">难度</span>
                <span class="stat-value">${DIFFICULTY_CONFIG[gameState.difficulty].name}</span>
            </div>
        `;
    } else {
        statsHtml += `
            <div class="stat-row">
                <span class="stat-label">到达关卡</span>
                <span class="stat-value">第 ${gameState.currentLevel} 关</span>
            </div>
        `;
    }
    
    elements.modalStats.innerHTML = statsHtml;
    elements.resultModal.classList.add('show');
    
    if (status === 'won') {
        const isHighScore = checkIsHighScore(
            gameState.mode, 
            gameState.score, 
            gameState.mode === 'level' ? gameState.currentLevel : 1
        );
        
        if (isHighScore) {
            setTimeout(() => {
                elements.resultModal.classList.remove('show');
                showNameInput();
            }, 800);
        }
    }
}

function hideResult() {
    elements.resultModal.classList.remove('show');
    if (elements.confettiContainer) {
        elements.confettiContainer.innerHTML = '';
    }
}

function showNameInput() {
    elements.playerNameInput.value = '';
    elements.nameInputModal.classList.add('show');
    setTimeout(() => {
        elements.playerNameInput.focus();
    }, 300);
}

function hideNameInput() {
    elements.nameInputModal.classList.remove('show');
}

function saveScore(name) {
    const rank = addToLeaderboard(
        gameState.mode,
        name,
        gameState.score,
        gameState.mode === 'classic' 
            ? (DIFFICULTY_CONFIG[gameState.difficulty].time - gameState.timeLeft)
            : gameState.pendingTime,
        gameState.mode === 'level' ? gameState.currentLevel : 1,
        gameState.mode === 'classic' ? DIFFICULTY_CONFIG[gameState.difficulty].name : ''
    );
    
    hideNameInput();
    
    elements.modalMessage.textContent = `恭喜！你的成绩排名第 ${rank} 位！`;
    elements.resultModal.classList.add('show');
}

function showLeaderboard(mode = 'classic') {
    const leaderboard = getLeaderboard(mode);
    
    if (leaderboard.length === 0) {
        elements.leaderboardList.innerHTML = `
            <div class="leaderboard-empty">
                暂无记录，快来创造第一个记录吧！
            </div>
        `;
    } else {
        elements.leaderboardList.innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.name}</div>
                    <div class="leaderboard-sub">
                        ${mode === 'level' ? `第${entry.level}关 · ` : ''}
                        ${entry.difficulty ? entry.difficulty + ' · ' : ''}
                        ${entry.date}
                    </div>
                </div>
                <div class="leaderboard-score">${entry.score}分</div>
            </div>
        `).join('');
    }
    
    elements.leaderboardModal.classList.add('show');
}

function hideLeaderboard() {
    elements.leaderboardModal.classList.remove('show');
}

function endGame(status) {
    gameState.status = status;
    gameState.isProcessing = true;
    stopTimer();
    
    if (gameState.mode === 'level' && status === 'won') {
        gameState.pendingScore = gameState.score;
        gameState.pendingTime = gameState.timeLeft;
    }
    
    showResult(status);
}

function resetGameState() {
    gameState.flippedCards = [];
    gameState.matchedCount = 0;
    gameState.isProcessing = false;
    gameState.combo = 0;
    gameState.score = 0;
    gameState.status = 'playing';
    
    if (gameState.mode === 'classic') {
        const config = DIFFICULTY_CONFIG[gameState.difficulty];
        gameState.totalPairs = config.pairs;
        gameState.timeLeft = config.time;
        gameState.scoreMultiplier = config.scoreMultiplier;
    } else {
        const levelData = LEVEL_CONFIG[gameState.currentLevel - 1];
        gameState.totalPairs = levelData.pairs;
        gameState.timeLeft = levelData.time;
        gameState.scoreMultiplier = 1 + (gameState.currentLevel - 1) * 0.2;
    }
}

function updateUI() {
    updateMatchedCount(0);
    updateTimerDisplay(gameState.timeLeft);
    updateScoreDisplay(0);
    updateComboDisplay(0);
    
    if (gameState.mode === 'level') {
        updateLevelDisplay(gameState.currentLevel);
        elements.levelItem.classList.remove('hidden');
        elements.difficultySelector.classList.add('hidden');
    } else {
        elements.levelItem.classList.add('hidden');
        elements.difficultySelector.classList.remove('hidden');
    }
}

function initializeGame() {
    stopTimer();
    hideResult();
    hideLevelComplete();
    hideComboBonus();
    resetGameState();
    updateUI();
    createCards();
    startTimer();
}

function goToStartScreen() {
    stopTimer();
    hideResult();
    hideLevelComplete();
    hideLeaderboard();
    hideNameInput();
    gameState.status = 'idle';
    elements.gameScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
}

function startGame() {
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    
    if (gameState.mode === 'level') {
        gameState.currentLevel = 1;
    }
    
    initializeGame();
}

function setMode(mode) {
    gameState.mode = mode;
    
    elements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    if (mode === 'classic') {
        elements.difficultySelector.classList.remove('hidden');
    } else {
        elements.difficultySelector.classList.add('hidden');
    }
}

function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    elements.difficultyButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
}

let isRestarting = false;

function restartGame() {
    if (isRestarting) return;
    
    isRestarting = true;
    
    if (gameState.mode === 'level') {
        gameState.currentLevel = 1;
    }
    
    initializeGame();
    
    setTimeout(() => {
        isRestarting = false;
    }, 300);
}

function setupEventListeners() {
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    
    elements.difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });
    
    elements.startBtn.addEventListener('click', startGame);
    elements.showLeaderboardBtn.addEventListener('click', () => showLeaderboard(gameState.mode));
    elements.backBtn.addEventListener('click', goToStartScreen);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.modalRestartBtn.addEventListener('click', () => {
        hideResult();
        restartGame();
    });
    elements.modalBackBtn.addEventListener('click', goToStartScreen);
    
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.levelBackBtn.addEventListener('click', goToStartScreen);
    
    elements.closeLeaderboardBtn.addEventListener('click', hideLeaderboard);
    
    elements.leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.leaderboardTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showLeaderboard(tab.dataset.mode);
        });
    });
    
    elements.saveNameBtn.addEventListener('click', () => {
        const name = elements.playerNameInput.value.trim();
        saveScore(name || '匿名玩家');
    });
    
    elements.skipNameBtn.addEventListener('click', () => {
        hideNameInput();
        elements.resultModal.classList.add('show');
    });
    
    elements.playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const name = elements.playerNameInput.value.trim();
            saveScore(name || '匿名玩家');
        }
    });
    
    elements.leaderboardModal.addEventListener('click', (e) => {
        if (e.target === elements.leaderboardModal) {
            hideLeaderboard();
        }
    });
}

setupEventListeners();
