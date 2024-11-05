const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 初始化音乐
const bgMusic = new Audio('./resources/background.mp3');
bgMusic.loop = true;

// 游戏参数
let score = 0;
let highestScore = localStorage.getItem('highestScore') || 0;
let gameOver = false;

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
    }

    update() {
        if (this.x + this.width > 0) {
            this.x -= 10;
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

// 游戏初始化
function startGame() {
    bgMusic.play();
    shuttlecockInterval = setInterval(generateShuttlecock, 2000);
    gameLoop();
}

// 结束游戏
function endGame() {
    clearInterval(shuttlecockInterval);
    // 移除事件监听器
    document.removeEventListener('keydown', handleKeyDown);
    // 显示重新开始按钮
    document.getElementById('restartButton').style.display = 'block';
}

// 处理键盘按下事件
function handleKeyDown(e) {
    if (e.key === 'w') {
        player.state = 'defenseA';
        setTimeout(() => player.state = 'stand', 500);
    } else if (e.key === 's') {
        player.state = 'defenseB';
        setTimeout(() => player.state = 'stand', 500);
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
    } else {
        gameOver = true;
        player.state = 'fail';
        bgMusic.pause();
        game.shuttlecocks = []; // 清空所有羽毛球
        endGame();
        console.log("游戏结束，准备结束或重启");
    }
}

// 生成羽毛球
function generateShuttlecock() {
    if (gameOver) return; // 游戏结束时停止生成
    const type = Math.random() > 0.5 ? 'A' : 'B';
    game.shuttlecocks.push(new Shuttlecock(type));
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

    // 增加分数
    if (!gameOver && game.timer % 10 === 0) {
        score++;
    }

    // 更新和绘制羽毛球
    game.shuttlecocks.forEach(shuttlecock => {
        shuttlecock.update();
        shuttlecock.draw();
        if (shuttlecock.checkCollision()) {
            handleCollision(shuttlecock);
        }
    });

    // 绘制角色
    drawPlayer();

    // 更新分数显示
    updateScoreDisplay();

    // 检查游戏是否结束
    if (gameOver) {
        ctx.fillStyle = '#b8860b';
        ctx.font = '25px Trajan Pro';
        ctx.fillText('Game Over', canvas.width / 2 - 75, canvas.height / 2 + 30);
    }

    requestAnimationFrame(gameLoop);
}

// 处理重新开始按钮点击
document.getElementById('restartButton').addEventListener('click', () => {
    // 重置游戏状态
    score = 0;
    gameOver = false;
    game.shuttlecocks = [];
    player.state = 'stand';
    player.successImage = null;
    bgMusic.currentTime = 0; // 重置音乐
    bgMusic.play(); // 重新播放音乐
    document.getElementById('restartButton').style.display = 'none'; // 隐藏按钮

    // 重新添加事件监听器
    document.addEventListener('keydown', handleKeyDown);

    startGame(); // 重新开始游戏
});

// 添加事件监听器
document.addEventListener('keydown', handleKeyDown);

// 启动游戏
startGame();
