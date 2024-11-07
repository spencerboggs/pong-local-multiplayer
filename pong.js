const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const borderPercent = 0.1;
const scaleFactor = Math.min(
    (window.innerWidth * (1 - borderPercent)) / 1024,
    (window.innerHeight * (1 - borderPercent)) / 576
);

canvas.width = 1024;
canvas.height = 576;
canvas.style.transformOrigin = '0 0';
canvas.style.transform = `scale(${scaleFactor})`;
canvas.style.position = 'absolute';
canvas.style.left = `${(window.innerWidth - canvas.width * scaleFactor) / 2}px`;
canvas.style.top = `${(window.innerHeight - canvas.height * scaleFactor) / 2}px`;

const canvasColor = 'black';
const lineColor = 'rgba(255, 255, 255, 0.05)';
const noiseIntensity = 0.05;

const playerSpeed = 5;

let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function addGrain() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        const randomNoise = (Math.random() - 0.5) * noiseIntensity * 255;
        pixels[i] += randomNoise;
        pixels[i + 1] += randomNoise;
        pixels[i + 2] += randomNoise;
    }
    context.putImageData(imageData, 0, 0);
}

function drawCRTScreen() {
    context.fillStyle = canvasColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 2) {
        context.fillStyle = lineColor;
        context.fillRect(0, y, canvas.width, 1);
    }
    addGrain();
}

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

const paddleWidth = 15;
const paddleHeight = 100;

const player1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: playerSpeed,
    dy: 0,
};

const player2 = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: playerSpeed,
    dy: 0,
};

let scorePlayer1 = 0;
let scorePlayer2 = 0;

function updatePaddles() {
    if (keys['w']) player1.dy = -playerSpeed;
    else if (keys['s']) player1.dy = playerSpeed;
    else player1.dy = 0;

    player1.y += player1.dy;
    player1.y = Math.max(0, Math.min(player1.y, canvas.height - paddleHeight));

    if (keys['ArrowUp']) player2.dy = -playerSpeed;
    else if (keys['ArrowDown']) player2.dy = playerSpeed;
    else player2.dy = 0;

    player2.y += player2.dy;
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - paddleHeight));

    if (keys['9']) {
        scorePlayer1++;
    } else if (keys['0']) {
        scorePlayer2++;
    } else if (keys['=']) {
        if (ball.speed < 100) {
            ball.speed += 0.2;
        }
        resetBall();
    } else if (keys['-']) {
        if (ball.speed > 0.2) {
            ball.speed -= 0.5;
        }
        resetBall();
    }

}

function drawPaddles() {
    context.fillStyle = 'white';
    context.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
    context.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);
}

const ballSize = 15;
let ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    speed: 5,
    dx: 5,
    dy: 5,
};

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y <= 0 || ball.y + ballSize >= canvas.height) ball.dy *= -1;

    if (ball.x <= player1.x + paddleWidth && ball.y + ballSize >= player1.y && ball.y <= player1.y + paddleHeight) {
        ball.dx *= -1;
    }
    if (ball.x + ballSize >= player2.x && ball.y + ballSize >= player2.y && ball.y <= player2.y + paddleHeight) {
        ball.dx *= -1;
    }

    if (ball.x <= 0) {
        scorePlayer2++;
        if (ball.speed < 100) {
            ball.speed += 0.2;
        }
        resetBall();
    }
    if (ball.x + ballSize >= canvas.width) {
        scorePlayer1++; {
            ball.speed += 0.2;
        }
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2 - ballSize / 2;
    ball.y = canvas.height / 2 - ballSize / 2;
    ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    ball.dy = ball.speed;
}

function drawBall() {
    context.fillStyle = 'white';
    context.fillRect(ball.x, ball.y, ballSize, ballSize);
}

function drawScore() {
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(`${scorePlayer1}   |   ${scorePlayer2}`, canvas.width / 2, 20);

    context.textBaseline = 'bottom';
    context.fillText(`Ball speed: ${ball.speed.toFixed(1)}`, canvas.width / 2, canvas.height - 20);

    context.textBaseline = 'top';
    context.fillText('W / S', 50, 10);
    context.textAlign = 'right';
    context.fillText('↑ / ↓', canvas.width - 10, 10);
}

function update(deltaTime) {
    updatePaddles();
    updateBall();
}

function draw() {
    drawCRTScreen();
    drawPaddles();
    drawBall();
    drawScore();
}
