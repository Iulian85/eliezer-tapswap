
import { TelegramService } from './telegram';
import { LevelConfig, PlayerProgress, Cell, CandyType, GameState } from './types';
import { LEVELS } from './levels';
import { CANDY_PATHS, CANDY_COLORS, playSound } from './assets';
import confetti from 'canvas-confetti';

// --- Global State ---
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let width: number, height: number;
let grid: Cell[][] = [];
let CELL_SIZE = 0;
let OFFSET_X = 0;
let OFFSET_Y = 0;

let currentLevel: LevelConfig | null = null;
let state: GameState = GameState.Idle;
let selectedCell: { r: number, c: number } | null = null;
let currentMoves = 0;
let currentScore = 0;
let animations: any[] = []; 

let progress: PlayerProgress = {
    highScores: {},
    stars: {},
    unlockedLevel: 1,
    totalStars: 0,
    soundEnabled: true
};

// --- Initialization ---

async function init() {
    try {
        console.log("Starting init...");
        TelegramService.init();
        
        // Load Save (with timeout protection)
        console.log("Loading progress...");
        const saved = await TelegramService.loadProgress();
        if (saved) {
            console.log("Progress loaded:", saved);
            progress = { ...progress, ...saved };
        } else {
            console.log("No saved progress found.");
        }
        
        updateMenuStats();
        
        // Setup UI
        setupScreens();
        
        // Canvas Setup
        canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) throw new Error("Canvas element not found");
        
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error("Could not get 2D context");
        ctx = context;
        
        resize();
        window.addEventListener('resize', resize);
        
        // Input
        canvas.addEventListener('pointerdown', handleInput);
        
        // Start Loop
        requestAnimationFrame(gameLoop);
        
        console.log("Init complete, showing menu.");
        showScreen('screen-menu');

    } catch (e) {
        console.error("CRITICAL INIT ERROR:", e);
        alert("Game Error: " + (e as Error).message);
        // Force show menu anyway so user isn't stuck
        showScreen('screen-menu');
    } finally {
        // Ensure loading screen is gone
        const loader = document.getElementById('screen-loading');
        if (loader && loader.classList.contains('active')) {
            loader.classList.remove('active');
        }
    }
}

function resize() {
    if (!canvas || !canvas.parentElement) return;
    
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    width = rect.width;
    height = rect.height;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    
    // Calc grid metrics
    if (currentLevel) {
        const padding = 20;
        const availableW = width - (padding * 2);
        const availableH = height - (padding * 2);
        
        CELL_SIZE = Math.min(availableW / currentLevel.cols, availableH / currentLevel.rows);
        OFFSET_X = (width - (CELL_SIZE * currentLevel.cols)) / 2;
        OFFSET_Y = (height - (CELL_SIZE * currentLevel.rows)) / 2;
    }
}

// --- Game Logic ---

function startLevel(levelId: number) {
    currentLevel = LEVELS.find(l => l.id === levelId)!;
    currentMoves = currentLevel.moves;
    currentScore = 0;
    state = GameState.Idle;
    selectedCell = null;
    animations = [];
    
    resize(); 
    initGrid();
    
    updateHUD();
    showScreen('screen-game');
    
    TelegramService.haptic('light');
}

function initGrid() {
    grid = [];
    for (let r = 0; r < currentLevel!.rows; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < currentLevel!.cols; c++) {
            row.push(createRandomCell(r, c));
        }
        grid.push(row);
    }
    
    // Resolve initial matches
    while (findMatches().length > 0) {
        for (let r = 0; r < currentLevel!.rows; r++) {
            for (let c = 0; c < currentLevel!.cols; c++) {
                grid[r][c].type = Math.floor(Math.random() * currentLevel!.colors);
            }
        }
    }
}

function createRandomCell(r: number, c: number): Cell {
    return {
        r, c,
        type: Math.floor(Math.random() * currentLevel!.colors),
        dx: 0, dy: -500,
        scale: 1,
        alpha: 1
    };
}

function handleInput(e: PointerEvent) {
    if (state !== GameState.Idle || !currentLevel) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - OFFSET_X;
    const y = e.clientY - rect.top - OFFSET_Y;
    
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);
    
    if (r >= 0 && r < currentLevel.rows && c >= 0 && c < currentLevel.cols) {
        if (!selectedCell) {
            selectedCell = { r, c };
            playSound('swap');
            TelegramService.haptic('light');
        } else {
            const dist = Math.abs(selectedCell.r - r) + Math.abs(selectedCell.c - c);
            if (dist === 1) {
                swapCells(selectedCell, { r, c });
                selectedCell = null;
            } else {
                if (selectedCell.r === r && selectedCell.c === c) {
                    selectedCell = null;
                } else {
                    selectedCell = { r, c };
                    playSound('swap');
                }
            }
        }
    }
}

async function swapCells(p1: { r: number, c: number }, p2: { r: number, c: number }) {
    state = GameState.Swapping;
    
    const c1 = grid[p1.r][p1.c];
    const c2 = grid[p2.r][p2.c];
    
    grid[p1.r][p1.c] = c2;
    grid[p2.r][p2.c] = c1;
    c1.r = p2.r; c1.c = p2.c;
    c2.r = p1.r; c2.c = p1.c;
    
    await animateSwap(c1, c2);
    
    const matches = findMatches();
    
    if (matches.length > 0) {
        currentMoves--;
        updateHUD();
        TelegramService.haptic('medium');
        await processMatches(matches);
    } else {
        playSound('swap'); 
        grid[p1.r][p1.c] = c1;
        grid[p2.r][p2.c] = c2;
        c1.r = p1.r; c1.c = p1.c;
        c2.r = p2.r; c2.c = p2.c;
        await animateSwap(c1, c2);
        state = GameState.Idle;
    }
}

async function processMatches(matches: Cell[]) {
    state = GameState.Matching;
    
    const points = matches.length * 10 * (matches.length - 2);
    addScore(points);
    playSound('pop');
    TelegramService.haptic('heavy');
    
    await animateClear(matches);
    
    matches.forEach(m => {
        grid[m.r][m.c].type = CandyType.Empty;
    });
    
    await applyGravity();
    
    const newMatches = findMatches();
    if (newMatches.length > 0) {
        setTimeout(() => processMatches(newMatches), 100);
    } else {
        checkWinCondition();
    }
}

function findMatches(): Cell[] {
    const matchedSet = new Set<Cell>();
    
    for (let r = 0; r < currentLevel!.rows; r++) {
        for (let c = 0; c < currentLevel!.cols - 2; c++) {
            const type = grid[r][c].type;
            if (type === CandyType.Empty) continue;
            let matchLen = 1;
            while (c + matchLen < currentLevel!.cols && grid[r][c + matchLen].type === type) {
                matchLen++;
            }
            if (matchLen >= 3) {
                for (let k = 0; k < matchLen; k++) matchedSet.add(grid[r][c + k]);
                c += matchLen - 1;
            }
        }
    }
    
    for (let c = 0; c < currentLevel!.cols; c++) {
        for (let r = 0; r < currentLevel!.rows - 2; r++) {
            const type = grid[r][c].type;
            if (type === CandyType.Empty) continue;
            let matchLen = 1;
            while (r + matchLen < currentLevel!.rows && grid[r + matchLen][c].type === type) {
                matchLen++;
            }
            if (matchLen >= 3) {
                for (let k = 0; k < matchLen; k++) matchedSet.add(grid[r + k][c]);
                r += matchLen - 1;
            }
        }
    }
    
    return Array.from(matchedSet);
}

async function applyGravity() {
    state = GameState.Falling;
    let moves = [];
    
    for (let c = 0; c < currentLevel!.cols; c++) {
        let writeR = currentLevel!.rows - 1;
        for (let r = currentLevel!.rows - 1; r >= 0; r--) {
            if (grid[r][c].type !== CandyType.Empty) {
                if (writeR !== r) {
                    const cell = grid[r][c];
                    grid[writeR][c] = cell;
                    grid[r][c] = { ...cell, type: CandyType.Empty, r, c }; 
                    
                    cell.prevR = cell.r; 
                    cell.r = writeR;
                    cell.c = c;
                    moves.push(cell);
                }
                writeR--;
            }
        }
        
        for (let r = writeR; r >= 0; r--) {
            const newCell = createRandomCell(r, c);
            grid[r][c] = newCell;
            newCell.dy = -CELL_SIZE * (writeR - r + 1) - 50; 
            moves.push(newCell);
        }
    }
    
    await animateFall(moves);
}

function checkWinCondition() {
    if (currentScore >= currentLevel!.targetScore) {
        if (currentMoves === 0 || state === GameState.Idle) {
            endGame(true);
            return;
        }
    }
    
    if (currentMoves <= 0) {
        if (currentScore >= currentLevel!.targetScore) endGame(true);
        else endGame(false);
        return;
    }
    
    state = GameState.Idle;
}

function endGame(win: boolean) {
    state = GameState.GameOver;
    const modal = document.getElementById('modal-gameover')!;
    const title = document.getElementById('go-title')!;
    const scoreTxt = document.getElementById('go-score')!;
    const nextBtn = document.getElementById('btn-next')!;
    
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.querySelector('div')!.style.transform = 'scale(1)';
    
    scoreTxt.innerText = `Score: ${currentScore}`;
    
    const stars = calculateStars();
    
    if (win) {
        playSound('win');
        TelegramService.notification('success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        title.innerText = "LEVEL COMPLETE";
        title.className = "text-4xl font-black text-green-500 mb-2 mt-4";
        nextBtn.style.display = 'block';
        
        progress.highScores[currentLevel!.id] = Math.max(currentScore, progress.highScores[currentLevel!.id] || 0);
        progress.stars[currentLevel!.id] = Math.max(stars, progress.stars[currentLevel!.id] || 0);
        if (currentLevel!.id === progress.unlockedLevel && progress.unlockedLevel < 15) {
            progress.unlockedLevel++;
        }
        
        progress.totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
        TelegramService.saveProgress(progress);
        
    } else {
        TelegramService.notification('error');
        title.innerText = "FAILED";
        title.className = "text-4xl font-black text-red-500 mb-2 mt-4";
        nextBtn.style.display = 'none';
    }
    
    [1, 2, 3].forEach((i) => {
        const starEl = document.getElementById(`star-${i}`)!;
        if (i <= stars) starEl.classList.replace('text-gray-300', 'text-yellow-400');
        else starEl.classList.replace('text-yellow-400', 'text-gray-300');
    });
}

function calculateStars(): number {
    const p = currentScore / currentLevel!.targetScore;
    if (p >= 1.5) return 3;
    if (p >= 1.2) return 2;
    if (p >= 1.0) return 1;
    return 0;
}

function animateSwap(c1: Cell, c2: Cell): Promise<void> {
    return new Promise(resolve => {
        const start = performance.now();
        const duration = 250;
        
        const dx1 = (c2.c - c1.c) * CELL_SIZE;
        const dy1 = (c2.r - c1.r) * CELL_SIZE;
        
        const dx2 = (c1.c - c2.c) * CELL_SIZE; 
        const dy2 = (c1.r - c2.r) * CELL_SIZE;
        
        c1.dx = -dx1; c1.dy = -dy1;
        c2.dx = -dx2; c2.dy = -dy2;
        
        function loop(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const ease = t * (2 - t); 
            
            c1.dx = -dx1 * (1 - ease);
            c1.dy = -dy1 * (1 - ease);
            c2.dx = -dx2 * (1 - ease);
            c2.dy = -dy2 * (1 - ease);
            
            if (t < 1) requestAnimationFrame(loop);
            else {
                c1.dx = 0; c1.dy = 0;
                c2.dx = 0; c2.dy = 0;
                resolve();
            }
        }
        requestAnimationFrame(loop);
    });
}

function animateClear(cells: Cell[]): Promise<void> {
    return new Promise(resolve => {
        const start = performance.now();
        
        function loop(now: number) {
            const t = Math.min((now - start) / 200, 1);
            cells.forEach(c => c.scale = 1 - t);
            if (t < 1) requestAnimationFrame(loop);
            else resolve();
        }
        requestAnimationFrame(loop);
    });
}

function animateFall(cells: Cell[]): Promise<void> {
    return new Promise(resolve => {
        const start = performance.now();
        
        function loop(now: number) {
            const t = Math.min((now - start) / 400, 1);
            const ease = t * t * (3 - 2 * t);
            
            let moving = false;
            
            cells.forEach(c => {
                if (c.prevR !== undefined) {
                    const dist = (c.r - c.prevR) * CELL_SIZE;
                    c.dy = -dist * (1 - ease);
                }
                
                if (Math.abs(c.dy) > 1) {
                    c.dy = c.dy * 0.9; 
                    moving = true;
                } else {
                    c.dy = 0;
                }
                c.scale = 1;
            });
            
            if (moving && (now - start) < 1000) requestAnimationFrame(loop);
            else {
                cells.forEach(c => { c.dy = 0; c.prevR = undefined; });
                resolve();
            }
        }
        requestAnimationFrame(loop);
    });
}

function gameLoop() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    if (currentLevel) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(OFFSET_X - 5, OFFSET_Y - 5, (CELL_SIZE * currentLevel.cols) + 10, (CELL_SIZE * currentLevel.rows) + 10, 10);
        ctx.fill();
        
        for (let r = 0; r < currentLevel.rows; r++) {
            for (let c = 0; c < currentLevel.cols; c++) {
                drawCell(r, c, grid[r][c]);
            }
        }
        
        if (selectedCell) {
            const cx = OFFSET_X + (selectedCell.c * CELL_SIZE);
            const cy = OFFSET_Y + (selectedCell.r * CELL_SIZE);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
            ctx.stroke();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function drawCell(r: number, c: number, cell: Cell) {
    if (cell.type === CandyType.Empty) return;
    
    const cx = OFFSET_X + (c * CELL_SIZE) + (CELL_SIZE / 2) + cell.dx;
    const cy = OFFSET_Y + (r * CELL_SIZE) + (CELL_SIZE / 2) + cell.dy;
    
    const size = (CELL_SIZE - 8) * cell.scale;
    if (size <= 0) return;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 50, size / 50); 
    ctx.translate(-25, -25); 
    
    ctx.fillStyle = CANDY_COLORS[cell.type];
    const path = CANDY_PATHS[cell.type];
    
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    
    ctx.fill(path);
    
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(15, 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function setupScreens() {
    document.getElementById('btn-play')!.onclick = () => showScreen('screen-levels');
    
    const gridEl = document.getElementById('levels-grid')!;
    gridEl.innerHTML = ''; 
    LEVELS.forEach(lvl => {
        const btn = document.createElement('button');
        const locked = lvl.id > progress.unlockedLevel;
        const stars = progress.stars[lvl.id] || 0;
        
        btn.className = `aspect-square rounded-xl flex flex-col items-center justify-center relative shadow-lg btn-push ${
            locked ? 'bg-gray-600 opacity-60' : 'bg-gradient-to-br from-blue-400 to-blue-600'
        }`;
        
        if (locked) {
            btn.innerHTML = `<span class="text-2xl">🔒</span>`;
            btn.disabled = true;
        } else {
            let starsHtml = '';
            for(let i=0; i<3; i++) starsHtml += `<span class="text-xs ${i<stars ? 'text-yellow-300' : 'text-blue-800'}">★</span>`;
            
            btn.innerHTML = `
                <span class="text-xl font-bold text-white">${lvl.id}</span>
                <div class="flex -mt-1">${starsHtml}</div>
            `;
            btn.onclick = () => startLevel(lvl.id);
        }
        gridEl.appendChild(btn);
    });
    
    document.getElementById('btn-home')!.onclick = () => {
        showScreen('screen-menu');
        updateMenuStats();
    };
    
    document.getElementById('btn-next')!.onclick = () => {
        const nextId = currentLevel!.id + 1;
        if (nextId <= 15) startLevel(nextId);
        else showScreen('screen-menu');
    };
    
    if (window.Telegram?.WebApp?.BackButton) {
        const backBtn = window.Telegram.WebApp.BackButton;
        backBtn.onClick(() => {
            if (state === GameState.Idle || state === GameState.GameOver) {
                 if(document.getElementById('screen-game')!.classList.contains('active')) {
                     showScreen('screen-levels');
                 } else if (document.getElementById('screen-levels')!.classList.contains('active')) {
                     showScreen('screen-menu');
                 }
            }
        });
    }
}

function updateMenuStats() {
    const el = document.getElementById('total-stars-display');
    if(el) el.innerText = `${progress.totalStars} / 45`;
}

function updateHUD() {
    document.getElementById('hud-moves')!.innerText = currentMoves.toString();
    document.getElementById('hud-score')!.innerText = currentScore.toString();
    document.getElementById('hud-target')!.innerText = currentLevel!.targetScore.toString();
    
    const pct = Math.min(100, (currentScore / currentLevel!.targetScore) * 100);
    document.getElementById('hud-progress-fill')!.style.width = `${pct}%`;
}

function addScore(amt: number) {
    currentScore += amt;
    updateHUD();
    
    const el = document.createElement('div');
    el.innerText = `+${amt}`;
    el.className = 'absolute text-2xl font-bold text-white drop-shadow-md animate-bounce';
    el.style.left = '50%';
    el.style.top = '40%';
    document.getElementById('floating-texts')!.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function showScreen(id: string) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(id)!.classList.add('active');
    
    const modal = document.getElementById('modal-gameover');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
    
    if (window.Telegram?.WebApp?.BackButton) {
        const backBtn = window.Telegram.WebApp.BackButton;
        if (id === 'screen-menu') backBtn.hide();
        else backBtn.show();
    }
}

// Start
init();
