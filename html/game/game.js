const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 初始化音乐
const bgMusic = new Audio('./resources/background.mp3');
bgMusic.loop = true;
// 初始化音效
const successSound = new Audio('./resources/successSound.mp3');
const missSound = new Audio('./resources/missSound.mp3');
const failSound = new Audio('./resources/failSound.mp3');

// 游戏参数
let score = 0;
let highestScore = localStorage.getItem('highestScore') || 0;
let gameOver = false;
let gameStarted = false;

// 角色初始化
const player = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    state: 'stand',
    successImage: null,
    failImage: './resources/playerFail.png',
};

// 羽毛球类
class Shuttlecock {
    constructor(type) {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100);
        this.width = 100;
        this.height = 100;
        this.type = type;
        this.speed = this.calculateSpeed();  // 初始速度根据分数计算
    }

    // 随分数动态调整羽毛球的速度
    calculateSpeed() {
        return 5 + Math.floor(score / 500);  // 基础速度为5，每100分增加1的速度
    }

    update() {
        this.speed = this.calculateSpeed();  // 每次更新重新计算速度
        if (this.x + this.width > 0) {
            this.x -= this.speed;
        } else {
            game.shuttlecocks = game.shuttlecocks.filter(sc => sc !== this);
        }
    }

    draw() {
        const image = new Image();
        image.src = this.type === 'A' ? './resources/shuttleA.png' : './resources/shuttleB.png';
        ctx.drawImage(image, this.x, this.y, this.width, this.height);
    }

    checkCollision() {
        const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
        const shuttlecockRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        return !(playerRect.x + playerRect.width < shuttlecockRect.x ||
            playerRect.x > shuttlecockRect.x + shuttlecockRect.width ||
            playerRect.y + playerRect.height < shuttlecockRect.y ||
            playerRect.y > shuttlecockRect.y + shuttlecockRect.height);
    }
}

const game = {
    shuttlecocks: [],
    timer: 0,
};

// 更新最高分数
function updateHighestScore() {
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore);
    }
}

// 绘制角色
function drawPlayer() {
    const image = new Image();
    let src;

    if (player.successImage) {
        src = player.successImage;
    } else {
        const states = {
            stand: player.frame === 0 ? './resources/playerStand1.png' : './resources/playerStand2.png',
            defenseA: './resources/playerDefenseA.png',
            defenseB: './resources/playerDefenseB.png',
            fail: player.failImage,
        };
        src = states[player.state] || states.stand;
    }

    image.src = src;
    ctx.drawImage(image, player.x, player.y, player.width, player.height);
}

let shuttlecockInterval;

// 游戏初始化（页面加载时显示角色与计分）
function initGame() {
    drawPlayer();
    updateScoreDisplay();
    document.getElementById('beginButton').style.display = 'block';
    
}

// 游戏开始
function startGame() {
    gameStarted = true;
    score = 0;
    gameOver = false;
    bgMusic.play();
    document.getElementById('beginButton').style.display = 'none';
    generateShuttlecock();  // 立即开始生成羽毛球
    gameLoop();
}

// 生成羽毛球，添加随机间隔
function generateShuttlecock() {
    if (gameOver) return;
    const type = Math.random() > 0.5 ? 'A' : 'B';
    game.shuttlecocks.push(new Shuttlecock(type));

    // 随机生成下一次羽毛球的生成间隔时间（500到1000毫秒之间）
    const randomInterval = Math.floor(Math.random() * 500) + 700;
    setTimeout(generateShuttlecock, randomInterval);
}

// 结束游戏
function endGame() {
    clearInterval(shuttlecockInterval);
    document.removeEventListener('keydown', handleKeyDown);
    document.getElementById('restartButton').style.display = 'block';
    clearInterval(shuttlecockInterval);
    document.removeEventListener('keydown', handleKeyDown);

    // 在游戏结束时更新最高分
    updateHighestScore();

    document.getElementById('restartButton').style.display = 'block';
}

// 处理键盘按下事件
function handleKeyDown(e) {
    if (gameStarted && !gameOver) {
        if (e.key === 'w') {
            player.state = 'defenseA';
            setTimeout(() => player.state = 'stand', 500);
        } else if (e.key === 's') {
            player.state = 'defenseB';
            setTimeout(() => player.state = 'stand', 500);
        }
    }
}

// 处理碰撞
function handleCollision(shuttlecock) {
    const isSuccess = (shuttlecock.type === 'A' && player.state === 'defenseA') ||
        (shuttlecock.type === 'B' && player.state === 'defenseB');

    if (isSuccess) {
        score += 100;
        game.shuttlecocks = game.shuttlecocks.filter(sc => sc !== shuttlecock);
        player.successImage = shuttlecock.type === 'A' ? './resources/defenseSuccessA.png' : './resources/defenseSuccessB.png';
        setTimeout(() => {
            player.successImage = null;
            player.state = 'stand';
        }, 500);

        // 播放击球成功音效
        playSound(successSound);
    } else {
        if (player.state === 'defenseA' || player.state === 'defenseB') {
            // 播放击球打空音效
            playSound(missSound);
        } else {
            // 播放击球失败音效
            playSound(failSound);
        }

        gameOver = true;
        player.state = 'fail';
        bgMusic.pause();
        game.shuttlecocks = [];
        endGame();
        console.log("游戏结束，准备结束或重启");
    }
}

// 播放音效的函数
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('highestScore').innerText = `Highest Score: ${highestScore}`;
}

// 游戏循环
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.timer++;

    if (!gameOver && game.timer % 10 === 0) {
        score++;
    }

    game.shuttlecocks.forEach(shuttlecock => {
        shuttlecock.update();
        shuttlecock.draw();
        if (shuttlecock.checkCollision()) {
            handleCollision(shuttlecock);
        }
    });

    drawPlayer();
    updateScoreDisplay();

    if (gameOver) {
        ctx.fillStyle = '#b8860b';
        ctx.font = '25px Trajan Pro';
        ctx.fillText('Game Over', canvas.width / 2 - 75, canvas.height / 2 + 30);
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// 处理重新开始按钮点击
document.getElementById('restartButton').addEventListener('click', () => {
    score = 0;
    gameOver = false;
    game.shuttlecocks = [];
    player.state = 'stand';
    player.successImage = null;
    bgMusic.currentTime = 0;
    bgMusic.play();
    document.getElementById('restartButton').style.display = 'none';
    document.addEventListener('keydown', handleKeyDown);
    startGame();
});

// 处理开始按钮点击
document.getElementById('beginButton').addEventListener('click', startGame);

// 添加事件监听器
document.addEventListener('keydown', handleKeyDown);

// 启动初始化
initGame();
