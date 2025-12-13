const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");
const rankingList = document.getElementById("rankingList");
const difficultySelect = document.getElementById("difficulty");

const canvasSize = 600;
canvas.width = canvasSize;
canvas.height = canvasSize;
canvas.setAttribute('tabindex', '0');

let cols = 20, rows = 20, cellSize;
let grid = [], stack = [];
let hero = { x: 0, y: 0 };
let goal = { x: 0, y: 0 };
let gameWon = false;

// Variables de animación
let currentHeroX = 0, currentHeroY = 0;
let targetHeroX = 0, targetHeroY = 0;
let isAnimating = false;
let animationStartTime = 0;

// Variables de confeti
let confettiAnimationId = null;
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

let startTime = 0, elapsedTime = 0;
let timerRunning = false, timerInterval;

// Cargar dificultad desde localStorage
let currentDifficulty = localStorage.getItem("mazeDifficulty") || "medium";
difficultySelect.value = currentDifficulty;

// Cargar resultados
let results = JSON.parse(localStorage.getItem("laberintoResultados")) || {};

function saveResults() {
    localStorage.setItem("laberintoResultados", JSON.stringify(results));
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        startTime = performance.now();
        timerInterval = setInterval(updateTimer, 10);
    }
}

function updateTimer() {
    elapsedTime = (performance.now() - startTime) / 1000;
    timerDisplay.textContent = "Tiempo: " + elapsedTime.toFixed(1);
}

function saveResult(playerName) {
    if (!results[currentDifficulty]) {
        results[currentDifficulty] = [];
    }

    results[currentDifficulty].push({
        name: playerName,
        time: parseFloat(elapsedTime.toFixed(1))
    });

    results[currentDifficulty].sort((a, b) => a.time - b.time);
    
    // Mantener máximo 12 entradas
    if (results[currentDifficulty].length > 8) {
        results[currentDifficulty] = results[currentDifficulty].slice(0,8);
    }
    
    saveResults();
    displayRanking();
}

function displayRanking() {
    rankingList.innerHTML = "";
    const currentResults = results[currentDifficulty] || [];

    currentResults.forEach(result => {
        const li = document.createElement("li");
        li.textContent = `${result.name}: ${result.time}s`;
        rankingList.appendChild(li);
    });
}

function generateMaze() {
    grid = [];
    stack = [];
    gameWon = false;
    timerRunning = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = "Tiempo: 0.0";

    cellSize = canvasSize / cols;
    hero = { x: 0, y: 0 };
    goal = { x: cols - 1, y: rows - 1 };

    currentHeroX = hero.x * cellSize + cellSize / 2;
    currentHeroY = hero.y * cellSize + cellSize / 2;
    targetHeroX = currentHeroX;
    targetHeroY = currentHeroY;
    isAnimating = false;

    initGrid();
    carvePath(hero.x, hero.y);
    drawMaze();
    canvas.focus();
    displayRanking();
}

function initGrid() {
    grid = [];
    for (let x = 0; x < cols; x++) {
        grid[x] = [];
        for (let y = 0; y < rows; y++) {
            grid[x][y] = {
                visited: false,
                walls: [true, true, true, true]
            };
        }
    }
}

function carvePath(x, y) {
    grid[x][y].visited = true;
    const directions = [0, 1, 2, 3];
    directions.sort(() => Math.random() - 0.5);
    directions.forEach(direction => {
        const [nx, ny] = move(x, y, direction);
        if (isInBounds(nx, ny) && !grid[nx][ny].visited) {
            grid[x][y].walls[direction] = false;
            grid[nx][ny].walls[(direction + 2) % 4] = false;
            carvePath(nx, ny);
        }
    });
}

function isInBounds(x, y) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}

function move(x, y, direction) {
    switch (direction) {
        case 0: return [x, y - 1];
        case 1: return [x + 1, y];
        case 2: return [x, y + 1];
        case 3: return [x - 1, y];
    }
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isAnimating) {
        const duration = 200;
        const progress = Math.min((performance.now() - animationStartTime) / duration, 1);
        const easeProgress = easeOutQuad(progress);
        
        currentHeroX = currentHeroX + (targetHeroX - currentHeroX) * easeProgress;
        currentHeroY = currentHeroY + (targetHeroY - currentHeroY) * easeProgress;

        if (progress >= 1) {
            isAnimating = false;
            currentHeroX = targetHeroX;
            currentHeroY = targetHeroY;
        }
        requestAnimationFrame(drawMaze);
    }

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const cell = grid[x][y];
            const xPos = x * cellSize;
            const yPos = y * cellSize;

            ctx.fillStyle = "rgba(33, 2, 46, 0.55)";
            ctx.fillRect(xPos, yPos, cellSize, cellSize);

            ctx.strokeStyle = "rgba(173, 0, 196, 0.5)";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.beginPath();
            if (cell.walls[0]) {
                ctx.moveTo(xPos, yPos);
                ctx.lineTo(xPos + cellSize, yPos);
            }
            if (cell.walls[1]) {
                ctx.moveTo(xPos + cellSize, yPos);
                ctx.lineTo(xPos + cellSize, yPos + cellSize);
            }
            if (cell.walls[2]) {
                ctx.moveTo(xPos + cellSize, yPos + cellSize);
                ctx.lineTo(xPos, yPos + cellSize);
            }
            if (cell.walls[3]) {
                ctx.moveTo(xPos, yPos + cellSize);
                ctx.lineTo(xPos, yPos);
            }
            ctx.stroke();
            ctx.shadowColor = "transparent";
        }
    }

    // Dibujar héroe
    const heroRadius = cellSize * 0.4;
    const heroGradient = ctx.createRadialGradient(
        currentHeroX, currentHeroY,
        heroRadius * 0.3,
        currentHeroX, currentHeroY,
        heroRadius
    );
    heroGradient.addColorStop(0, "#ff6666");
    heroGradient.addColorStop(1, "#990000");

    ctx.beginPath();
    ctx.arc(currentHeroX, currentHeroY, heroRadius, 0, Math.PI * 2);
    ctx.fillStyle = heroGradient;
    ctx.fill();
    ctx.closePath();

    // Dibujar meta orgánica
    const goalX = goal.x * cellSize + cellSize / 2;
    const goalY = goal.y * cellSize + cellSize / 2;
    const goalSize = cellSize * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(goalX + goalSize * 0.5, goalY);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 4) * Math.PI;
        const radius = goalSize * (i % 2 === 0 ? 0.6 : 0.4);
        const x = goalX + radius * Math.cos(angle);
        const y = goalY + radius * Math.sin(angle);
        ctx.quadraticCurveTo(
            goalX + goalSize * 0.5 * Math.cos(angle),
            goalY + goalSize * 0.5 * Math.sin(angle),
            x,
            y
        );
    }
    ctx.closePath();

    const goalGradient = ctx.createLinearGradient(
        goalX - goalSize, goalY - goalSize,
        goalX + goalSize, goalY + goalSize
    );
    goalGradient.addColorStop(0, "#4CAF50");
    goalGradient.addColorStop(1, "#2E7D32");

    ctx.fillStyle = goalGradient;
    ctx.shadowColor = 'rgba(46, 125, 50, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function easeOutQuad(t) {
    return t * (2 - t);
}

canvas.addEventListener("keydown", (e) => {
    if (gameWon) return;
    if (!timerRunning) startTimer();

    const key = e.key;
    let newX = hero.x;
    let newY = hero.y;

    switch (key) {
        case "ArrowUp":
            if (!grid[hero.x][hero.y].walls[0]) newY--;
            break;
        case "ArrowRight":
            if (!grid[hero.x][hero.y].walls[1]) newX++;
            break;
        case "ArrowDown":
            if (!grid[hero.x][hero.y].walls[2]) newY++;
            break;
        case "ArrowLeft":
            if (!grid[hero.x][hero.y].walls[3]) newX--;
            break;
        default:
            return;
    }

    if (isInBounds(newX, newY)) {
        hero.x = newX;
        hero.y = newY;
        targetHeroX = hero.x * cellSize + cellSize / 2;
        targetHeroY = hero.y * cellSize + cellSize / 2;
        
        if (!isAnimating) {
            currentHeroX = hero.x * cellSize + cellSize / 2;
            currentHeroY = hero.y * cellSize + cellSize / 2;
        }
        
        animationStartTime = performance.now();
        isAnimating = true;
        
        if (hero.x === goal.x && hero.y === goal.y) {
            gameWon = true;
            clearInterval(timerInterval);
            setTimeout(() => {
                showWinPopup();
                startConfetti();
            }, 150);
        }
        
        e.preventDefault();
        requestAnimationFrame(drawMaze);
    }
});

function startConfetti() {
    stopConfetti();
    
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const numConfetti = 200;

    for (let i = 0; i < numConfetti; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -Math.random() * confettiCanvas.height,
            r: Math.random() * 8 + 4,
            d: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            angle: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 0.2
        });
    }

    function drawConfetti() {
        confettiCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        confettiCtx.fillRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiPieces.forEach((p) => {
            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.angle);
            
            confettiCtx.fillStyle = p.color;
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, p.r, 0, Math.PI * 2);
            confettiCtx.fill();
            
            confettiCtx.restore();

            p.y += p.d;
            p.x += Math.sin(p.angle * 2) * 2;
            p.angle += p.rotation;

            if (p.y > confettiCanvas.height + 100) {
                p.y = -20;
                p.x = Math.random() * confettiCanvas.width;
            }
        });

        confettiAnimationId = requestAnimationFrame(drawConfetti);
    }

    drawConfetti();
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

function showWinPopup() {
    const popup = document.getElementById('winPopup');
    const popupTime = document.getElementById('winTime');
    const playerNameInput = document.getElementById('playerName');
    
    playerNameInput.value = '';
    popupTime.textContent = `Tiempo: ${elapsedTime.toFixed(1)}s`;
    popup.classList.remove('hide');
    popup.classList.add('show');
    playerNameInput.focus();
}

const saveButton = document.getElementById('saveButton');
const playerNameInput = document.getElementById('playerName');

function saveAndRestart() {
    const popup = document.getElementById('winPopup');
    let playerName = playerNameInput.value.trim();
    if (!playerName) playerName = "Anónimo";

    saveResult(playerName);

    popup.classList.remove('show');
    popup.classList.add('hide');
    stopConfetti();

    const gameContainer = document.getElementById('gameContainer');
    gameContainer.classList.add('fade-out');

    setTimeout(() => {
        updateDimensions();
        gameContainer.classList.remove('fade-out');
    }, 500);
}

saveButton.addEventListener('click', saveAndRestart);

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveAndRestart();
    }
});

function updateDimensions() {
    switch (currentDifficulty) {
        case "easy":
            cols = 10;
            rows = 10;
            break;
        case "medium":
            cols = 20;
            rows = 20;
            break;
        case "hard":
            cols = 30;
            rows = 30;
            break;
        case "extreme":
            cols = 40;
            rows = 40;
            break;
    }

    generateMaze();
}

difficultySelect.addEventListener("change", () => {
    currentDifficulty = difficultySelect.value;
    localStorage.setItem("mazeDifficulty", currentDifficulty);
    updateDimensions();
    displayRanking();
});

window.onload = function() {
    currentDifficulty = localStorage.getItem("mazeDifficulty") || "medium";
    difficultySelect.value = currentDifficulty;
    results = JSON.parse(localStorage.getItem("laberintoResultados")) || {};
    displayRanking();
    updateDimensions();
    canvas.focus();
};