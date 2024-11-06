const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ��ʼ������
const bgMusic = new Audio('./resources/background.mp3');
bgMusic.loop = true;
// ��ʼ����Ч
const successSound = new Audio('./resources/successSound.mp3');
const missSound = new Audio('./resources/missSound.mp3');
const failSound = new Audio('./resources/failSound.mp3');

// ��Ϸ����
let score = 0;
let highestScore = localStorage.getItem('highestScore') || 0;
let gameOver = false;
let gameStarted = false;

// ��ɫ��ʼ��
const player = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    state: 'stand',
    successImage: null,
    failImage: './resources/playerFail.png',
};

// ��ë����
class Shuttlecock {
    constructor(type) {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100);
        this.width = 100;
        this.height = 100;
        this.type = type;
        this.speed = this.calculateSpeed();  // ��ʼ�ٶȸ��ݷ�������
    }

    // �������̬������ë����ٶ�
    calculateSpeed() {
        return 5 + Math.floor(score / 500);  // �����ٶ�Ϊ5��ÿ100������1���ٶ�
    }

    update() {
        this.speed = this.calculateSpeed();  // ÿ�θ������¼����ٶ�
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

// ������߷���
function updateHighestScore() {
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore);
    }
}

// ���ƽ�ɫ
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

// ��Ϸ��ʼ����ҳ�����ʱ��ʾ��ɫ��Ʒ֣�
function initGame() {
    drawPlayer();
    updateScoreDisplay();
    document.getElementById('beginButton').style.display = 'block';
    
}

// ��Ϸ��ʼ
function startGame() {
    gameStarted = true;
    score = 0;
    gameOver = false;
    bgMusic.play();
    document.getElementById('beginButton').style.display = 'none';
    generateShuttlecock();  // ������ʼ������ë��
    gameLoop();
}

// ������ë�����������
function generateShuttlecock() {
    if (gameOver) return;
    const type = Math.random() > 0.5 ? 'A' : 'B';
    game.shuttlecocks.push(new Shuttlecock(type));

    // ���������һ����ë������ɼ��ʱ�䣨500��1000����֮�䣩
    const randomInterval = Math.floor(Math.random() * 500) + 700;
    setTimeout(generateShuttlecock, randomInterval);
}

// ������Ϸ
function endGame() {
    clearInterval(shuttlecockInterval);
    document.removeEventListener('keydown', handleKeyDown);
    document.getElementById('restartButton').style.display = 'block';
    clearInterval(shuttlecockInterval);
    document.removeEventListener('keydown', handleKeyDown);

    // ����Ϸ����ʱ������߷�
    updateHighestScore();

    document.getElementById('restartButton').style.display = 'block';
}

// ������̰����¼�
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

// ������ײ
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

        // ���Ż���ɹ���Ч
        playSound(successSound);
    } else {
        if (player.state === 'defenseA' || player.state === 'defenseB') {
            // ���Ż�������Ч
            playSound(missSound);
        } else {
            // ���Ż���ʧ����Ч
            playSound(failSound);
        }

        gameOver = true;
        player.state = 'fail';
        bgMusic.pause();
        game.shuttlecocks = [];
        endGame();
        console.log("��Ϸ������׼������������");
    }
}

// ������Ч�ĺ���
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// ���·�����ʾ
function updateScoreDisplay() {
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('highestScore').innerText = `Highest Score: ${highestScore}`;
}

// ��Ϸѭ��
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

// �������¿�ʼ��ť���
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

// ����ʼ��ť���
document.getElementById('beginButton').addEventListener('click', startGame);

// ����¼�������
document.addEventListener('keydown', handleKeyDown);

// ������ʼ��
initGame();
