// Game variables
let canvas, ctx, player, bullets, enemies, asteroids, score, lives, gameLoop, isGameRunning, isInvincible;

// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;
    // Game state
    score = 0;
    lives = 3;
    isGameRunning = true;
    isInvincible = false;
    // Player
    player = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        width: 30,
        height: 20,
        speed: 5
    };
    // Arrays
    bullets = [];
    enemies = [];
    asteroids = [];
    // Update UI immediately
    updateScore();
    updateLives();
    // Start game loop
    gameLoop = setInterval(updateGame, 1000/60);
    // Event listeners
    canvas.addEventListener('mousemove', movePlayer);
    canvas.addEventListener('click', shoot);
    // Spawn enemies and asteroids
    setInterval(spawnEnemy, 2000);
    setInterval(spawnAsteroid, 1500);
}
// Move player with mouse
function movePlayer(e) {
    if (!isGameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    player.x = mouseX - player.width / 2;
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}
// Shoot bullet
function shoot() {
    if (!isGameRunning) return;
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: 7
    });
}
// Spawn enemy
function spawnEnemy() {
    if (!isGameRunning) return;
    enemies.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 2 + Math.random() * 2,
        hitPlayer: false
    });
}
// Spawn asteroid
function spawnAsteroid() {
    if (!isGameRunning) return;
    asteroids.push({
        x: Math.random() * (canvas.width - 15),
        y: -15,
        width: 15,
        height: 15,
        speed: 0.5 + Math.random() * 1,
        hitPlayer: false
    });
}
// Take damage
function takeDamage() {
    if (isInvincible) return;
    lives--;
    updateLives();
    if (lives <= 0) {
        gameOver();
    } else {
        // Brief invincibility period
        isInvincible = true;
        setTimeout(() => {
            isInvincible = false;
        }, 1500);
    }
}
// Update game
function updateGame() {
    if (!isGameRunning) return;
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw player (blink if invincible)
    if (!isInvincible || Math.floor(Date.now() / 100) % 2) {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    // Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        // Remove bullets that are off screen
        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }
    // Update and draw enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (checkCollision(bullet, enemy)) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                updateScore();
                break;
            }
        }
        // Check collision with player (only if not already hit)
        if (!enemy.hitPlayer && checkCollision(enemy, player)) {
            enemy.hitPlayer = true;
            takeDamage();
        }
        // Remove enemies that are off screen
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
    // Update and draw asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (checkCollision(bullet, asteroid)) {
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                score += 5;
                updateScore();
                break;
            }
        }
        // Check collision with player (only if not already hit)
        if (!asteroid.hitPlayer && checkCollision(asteroid, player)) {
            asteroid.hitPlayer = true;
            takeDamage();
        }
        // Remove asteroids that are off screen
        if (asteroid.y > canvas.height) {
            asteroids.splice(i, 1);
        }
    }
}
// Check collision between two objects
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}
// Update lives display
function updateLives() {
    document.getElementById('lives').textContent = lives;
}
// Game over
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}
// Restart game
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    initGame();
}
// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}
// Initialize everything when page loads
window.addEventListener('load', function() {
    createParticles();
    initGame();
});
