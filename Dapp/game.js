const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 25; // Hücre boyutu
const width = 32; // Labirent genişliği (hücre sayısı)
const height = 24; // Labirent yüksekliği (hücre sayısı)
const gameDuration = 60;// Oyuncunun tamamlaması gereken süre (saniye)


let skor = 0; // oyunucunun biriktirdiği skor
let startTime = Date.now(); // Oyunun başlangıç zamanı
let maze; // Labirent matrisi
let playerPos; // Oyuncu başlangıç pozisyonu
let finishPos; // Bitiş noktası

// Labirent oluşturma (Depth-First Search algoritması)
// Labirent oluşturma (DFS)
function generateMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Başlangıçta tüm hücreler duvar
    const stack = [];
    const visited = new Set();

    const directions = [
        [-1, 0], // Yukarı
        [1, 0],  // Aşağı
        [0, -1], // Sol
        [0, 1]   // Sağ
    ];

    // Başlangıç noktası
    const startX = 0;
    const startY = 0;
    stack.push([startX, startY]);
    visited.add(`${startX},${startY}`);
    maze[startY][startX] = 0; // Yol olarak işaretle

    // DFS algoritması
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = [];

        for (const [dx, dy] of directions) {
            const nx = x + dx * 2; // İki hücre ilerle
            const ny = y + dy * 2; // İki hücre ilerle
            if (nx >= 0 && ny >= 0 && nx < width && ny < height && !visited.has(`${nx},${ny}`)) {
                neighbors.push([nx, ny, dx, dy]);
            }
        }

        if (neighbors.length > 0) {
            const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push([nx, ny]);
            visited.add(`${nx},${ny}`);
            maze[ny][nx] = 0; // Yeni hücreyi yol yap
            maze[y + dy][x + dx] = 0; // Aradaki hücreyi de yol yap
        } else {
            stack.pop();
        }
    }

    return maze;
}


// Rastgele açık bir bitiş noktası seçme
function getRandomFinishPosition(maze) {
    const openPositions = [];
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 0) { // Sadece yolları kontrol et
                openPositions.push([col, row]);
            }
        }
    }
    return openPositions[Math.floor(Math.random() * openPositions.length)];
}

function drawTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Geçen süre (saniye)
    const remainingTime = Math.max(gameDuration - elapsedTime, 0); // Kalan süreyi hesapla

    // Süreyi ekrana yaz
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText(`Süre: ${remainingTime}s`, 10, 20);

    // Süre dolduysa oyunu bitir
    if (remainingTime <= 0) {
        alert('Süre doldu! Kaybettiniz!');
        resetGame(); // Oyunu yeniden başlat
    }
}

function skorsayma() {


    // Skoru ekrana yaz
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText(`Skor: ${skor}`, 10, 40); // Skoru göster
}

// Oyun başlangıç ayarları
function startGame() {
    maze = generateMaze(width, height);
    playerPos = [0, 0]; // Oyuncu başlangıç noktası
    finishPos = getRandomFinishPosition(maze); // Rastgele bir bitiş noktası seç
}

// Labirenti çizme
function drawMaze() {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const color = maze[row][col] === 1 ? 'black' : 'white'; // Duvar = beyaz, Yol = siyah
            ctx.fillStyle = color;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Oyuncu çizimi
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
        playerPos[0] * cellSize + cellSize / 2,
        playerPos[1] * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Bitiş noktası çizimi
    ctx.fillStyle = 'red';
    ctx.fillRect(finishPos[0] * cellSize, finishPos[1] * cellSize, cellSize, cellSize);
}


// Klavye olaylarını dinleme
document.addEventListener('keydown', (event) => {
    const [x, y] = playerPos;
    if (event.key === 'ArrowUp' && y > 0 && maze[y - 1][x] === 0) {
        playerPos[1] -= 1;
    } else if (event.key === 'ArrowDown' && y < height - 1 && maze[y + 1][x] === 0) {
        playerPos[1] += 1;
    } else if (event.key === 'ArrowLeft' && x > 0 && maze[y][x - 1] === 0) {
        playerPos[0] -= 1;
    } else if (event.key === 'ArrowRight' && x < width - 1 && maze[y][x + 1] === 0) {
        playerPos[0] += 1;
    }
    if (event.key === 'w' && y > 0 && maze[y - 1][x] === 0) {
        playerPos[1] -= 1;
    } else if (event.key === 's' && y < height - 1 && maze[y + 1][x] === 0) {
        playerPos[1] += 1;
    } else if (event.key === 'a' && x > 0 && maze[y][x - 1] === 0) {
        playerPos[0] -= 1;
    } else if (event.key === 'd' && x < width - 1 && maze[y][x + 1] === 0) {
        playerPos[0] += 1;
    }
});

// Oyun döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı temizle
    drawMaze();// Labirenti çiz
    drawTimer(); // Süreyi çiz


    // Oyuncu bitiş noktasına ulaştıysa
    if (playerPos[0] === finishPos[0] && playerPos[1] === finishPos[1]) {
        alert("Kazandınız!");
        startTime = Date.now(); // Süreyi sıfırla
        startGame(); // Yeni bir oyun başlat
        skor++;
    }
    skorsayma();
    requestAnimationFrame(gameLoop); // Oyun döngüsünü devam ettir
}
function resetGame() {
    maze = generateMaze(width, height); // Yeni bir labirent oluştur
    playerPos = [0, 0]; // Oyuncu başlangıç noktasına dönsün
    finishPos = getRandomFinishPosition(maze); // Rastgele bir bitiş noktası seç
    startTime = Date.now(); // Süreyi sıfırla
    gameLoop(); // Oyunu yeniden başlat

}


// Oyunu başlat
startGame();
gameLoop();
