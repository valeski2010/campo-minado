// Campo Minado (Minesweeper) in p5.js simple

let cols = 10;
let rows = 10;
let tileSize = 35;
let totalMines = 15;

let board = [];
let gameOver = false;
let gameWon = false;

const fruitEmojis = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍒', '🍉'];
const bombEmoji = '💣';
const flagEmoji = '🚩';

function setup() {
  createCanvas(cols * tileSize, rows * tileSize + 40);
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.6);
  resetGame();
}

function resetGame() {
  board = [];
  gameOver = false;
  gameWon = false;
  for(let y = 0; y < rows; y++) {
    let row = [];
    for(let x = 0; x < cols; x++) {
      row.push({
        revealed: false,
        mine: false,
        flag: false,
        neighborCount: 0
      });
    }
    board.push(row);
  }
  placeMines();
  calcNeighbors();
  loop();
}

function placeMines() {
  let placed = 0;
  while(placed < totalMines) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    if(!board[y][x].mine) {
      board[y][x].mine = true;
      placed++;
    }
  }
}

function calcNeighbors() {
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < cols; x++) {
      if(board[y][x].mine) {
        board[y][x].neighborCount = -1;
        continue;
      }
      let count = 0;
      for(let ny = max(0,y-1); ny <= min(rows-1,y+1); ny++) {
        for(let nx = max(0,x-1); nx <= min(cols-1,x+1); nx++) {
          if(board[ny][nx].mine) count++;
        }
      }
      board[y][x].neighborCount = count;
    }
  }
}

function draw() {
  background('#cfe3a8');
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < cols; x++) {
      drawCell(x,y);
    }
  }
  
  fill(gameOver ? '#b22222' : gameWon ? '#228B22' : '#2e4a20');
  noStroke();
  textSize(22);
  if(gameOver) {
    text('BOOM! Você perdeu. Clique para reiniciar.', width/2, height - 20);
  } else if(gameWon) {
    text('Parabéns! Você venceu! Clique para reiniciar.', width/2, height - 20);
  } else {
    text('Clique para revelar. Clique direito para marcar.', width/2, height - 20);
  }
}

function drawCell(x, y) {
  let c = board[y][x];
  let px = x * tileSize;
  let py = y * tileSize;
  
  stroke('#758354');
  strokeWeight(1);
  
  if(c.revealed) {
    fill(200, 220, 160);
    rect(px, py, tileSize, tileSize);
    noStroke();
    if(c.mine) {
      textSize(tileSize * 0.8);
      text(bombEmoji, px + tileSize / 2, py + tileSize / 2 + 2);
    } else if(c.neighborCount > 0) {
      fill('#3a5020');
      text(fruitEmojis[c.neighborCount - 1], px + tileSize / 2, py + tileSize / 2 + 2);
    }
  } else {
    fill('#a0a497');
    rect(px, py, tileSize, tileSize);
    if(c.flag) {
      fill('#d74040');
      textSize(tileSize * 0.8);
      text(flagEmoji, px + tileSize / 2, py + tileSize / 2 + 2);
    }
  }
}

function mousePressed() {
  if(mouseY > rows * tileSize) {
    resetGame();
    return;
  }
  if(gameOver || gameWon) return;

  let x = floor(mouseX / tileSize);
  let y = floor(mouseY / tileSize);

  if(x < 0 || y < 0 || x >= cols || y >= rows) return;

  if(mouseButton === LEFT) {
    if(!board[y][x].flag) {
      revealCell(x, y);
      checkWin();
    }
  } else if(mouseButton === RIGHT) {
    if(!board[y][x].revealed) {
      board[y][x].flag = !board[y][x].flag;
    }
  }
}

function revealCell(x, y) {
  let c = board[y][x];
  if(c.revealed || c.flag) return;
  c.revealed = true;

  if(c.mine) {
    gameOver = true;
    revealAllMines();
    noLoop();
  } else if(c.neighborCount === 0) {
    for(let ny = max(0, y - 1); ny <= min(rows - 1, y + 1); ny++) {
      for(let nx = max(0, x - 1); nx <= min(cols - 1, x + 1); nx++) {
        if(nx !== x || ny !== y) {
          revealCell(nx, ny);
        }
      }
    }
  }
}

function revealAllMines() {
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < cols; x++) {
      if(board[y][x].mine) {
        board[y][x].revealed = true;
      }
    }
  }
}

function checkWin() {
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < cols; x++) {
      let c = board[y][x];
      if(!c.mine && !c.revealed) return;
    }
  }
  gameWon = true;
  revealAllMines();
  noLoop();
}

document.oncontextmenu = () => false; // disable right-click menu for flagging

