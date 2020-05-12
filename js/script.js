"use strict";

/*****************

Campfire Snakes and Ladders
Sylvain Tran

This is a simple variation on Snakes and Ladders (the board game).
28-04-2020

******************/

let p1 = {
    position: 99, // the absolute movement value
    x: 1150, // the mapped position x on the board
    y: 1150, // ' ' y on the board
    color: '#003d17' // player's color
}

let p2 = {
    position: 99,
    x: 1150,
    y: 1150,
    color: '#690000'
}
// Turn refers to the player's turn: 1 is p1, 2 is p2
let turn = 1;
let turnDuration = 5000; // in ms
let dice; // the dice to throw to move each turn
let board; // the board to fill with snakes and ladders
let rows;
let cols;
let tileWidth = 128; // By default a tile's width and height is 1/10 of 1280
let tileHeight = 128;

/*
    preload()
    Preloads assets.
*/
function preload() {

}


/*
    setup()
    Setup canvas, including the board and its contents.
*/
function setup() {
    // Create the canvas
    let game = createCanvas(1280, 1280); // 1280, 1280 by default
    game.parent('game__container');
    // Adjust rows and cols by tileWidth and height of canvas
    tileWidth = width/10; // default: 128
    tileHeight = height/10; // default: 128
    cols = floor(width/tileWidth); // default: 10
    rows = floor(height/tileHeight); // default: Same as cols 
    // Create a new board
    board = makeBoard(rows, cols);
    // Fill the board
    fillBoard();
    placeLadders();
    placeSnakes(board);
}

/*
    fillBoard()
    Fills the board with cells.
*/
function fillBoard() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Add an object with x, y as row, column, with random color and no snake or ladder by default
            let data = {
                i: i,
                j: j,
                x: i * tileWidth,
                y: j * tileHeight,
                width: tileWidth,
                height: tileHeight,
                color: color(125, 125, 125),
                snake: false,
                ladder: false,
                ladderTop: false
            };
            board[i][j] = new Cell(data);
        }
    }
}

/*
    makeBoard()
    Create the board (cols and rows).
*/
function makeBoard(rows, cols) {
    board = new Array(cols);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(rows);
    }
    return board;
}

/*
    placeLadders()
    Place the aldders at the beginning of the game.
*/
function placeLadders() {
    let nbOfTiles = rows * cols; // 100
    let nbLadders = nbOfTiles / 10; // The original Milton equal number of ladders and snakes, could be changed later to create variations
    // Place ladders at random positions of the board
    // Ruleset: max 1 ladder per row
    let ladderPositions = [];
    let ladderFootPlaced = [];
    // Create a ladder for each row
    for(let i = 0; i < rows; i++) {
        let ladder = floor(Math.random() * (cols - 1));
        ladderPositions.push(ladder);
    }
    // Get in the board data and place the ladders at these positions except the last row at the top
    // Starting at i = 1 to skip the first row
    for(let i = 1; i < rows; i++) {
        let r = 0;
        for(let j = 0; j < cols; j++) {
            // Todo make sure no overlap ladder top and ladder foot
            let ladderFoot = ladderPositions[i];
            board[ladderFoot][i].setLadder(true);    
            r = ladderFoot;
        }
        ladderFootPlaced.push(board[r][i].i + ", " + board[r][i].j); // col then row
    }
    // Set ladder tops for each ladder
    for(let i = 0; i < ladderFootPlaced.length; i++) {
        let l = ladderFootPlaced[i].toString();
        // A ladder climbs at least one row above the current one, and max to the last row
        let coords = l.split(",");
        let maxClimb = coords[1] - 1;
        // // Substract to move up - for rows, climb from at least one up to 0 which is the first row
        let ladderLength = round(random(maxClimb, 0));
        console.log("Ladder length (row where the top rests): " + ladderLength);
        // For ladder top's col, take a random number in range
        let ladderTopCol = round(random(0, cols - 1));
        console.log("ladder top at: " + ladderLength + ", " + ladderTopCol);
        board[ladderTopCol][ladderLength].setLadderTop(true);
        // Add this ladder top coord to the cell with the ladder's foot
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        board[r][c].getCell().ladderTopCoords = { 
            x: board[ladderTopCol][ladderLength].x, 
            y: board[ladderTopCol][ladderLength].y,
            row: ladderLength,
            col: ladderTopCol
        };        
    }
}

function placeSnakes() {
    // Amount of snakes is at least half of the number of rows 
    let nbOfSnakes = round(random(rows/2, rows));
    for(let i = 0; i < nbOfSnakes; i++) {
        // Starting at the first row
        let c = round(random(0, cols - 1));
        let r = round(random(0, rows - 1));
        if(r === (rows - 1)) r = rows - 2;
        // If there is no ladder or snakes placed at this cell, place a snake
        if(!board[c][r].getCell().ladder &&
           !board[c][r].getCell().ladderTopCoords &&
           !board[c][r].getCell().snake && 
           !board[c][r].getCell().snakeCoords) 
        {
            board[c][r].getCell().snake = true; 
            board[c][r].getCell().snakeCoords;           
            // Maximum row to drop to is the bottomest row
            let maxDrop = rows - 1;
            let snakeTopCol = round(random(0, cols - 1));
            // The row the snake length is set to a random row except the bottomest row
            let snakeLength = round(random(board[c][r].getCell().j + 1, maxDrop - 1));
            board[snakeTopCol][snakeLength].setSnakeBottom(true);
            board[c][r].getCell().snakeCoords = { 
                x: board[snakeTopCol][snakeLength].x, 
                y: board[snakeTopCol][snakeLength].y,
                row: snakeLength,
                col: snakeTopCol
            };                  
        }
    }

}

/*
    changeTurns
    Change turns from p1 to p2 and vice-versa.
*/
function changeTurns() {
    if (turn === 1) {
        // Throw the dice (ints 1-6)
        dice = Math.floor(random(1, 7));
        move(1, dice);
        // then change to 2
        turn = 2;
        // background(p2.color); // Background is red for p2
        // showText(dice);
    } else {
        dice = Math.floor(random(1, 7));
        move(2, dice);
        turn = 1;
        // background(p1.color); // Background is green for p1
        // showText(dice);
    }
}

function displayPlayer() {
    stroke(1);
    push();
    fill(p1.color);
    ellipse(p1.x + 64, p1.y + 64, 64);
    pop();
    push();
    fill(p2.color);
    ellipse(p2.x + 64, p2.y + 64, 64);
    pop();
}

/*
    move
    Moves the player of the current turn by the value of the dice thrown this turn.
    constrained between 0, 100 (board size).
*/
function move(player, moveValue) {
    if (player === 1) {
        p1.position -= moveValue; // base 100
        p1.position = constrain(p1.position, 0, 100);
        console.log(p1.position);
        // Translate the value of a tile (col i, row j) base 10 (always cols) into an absolute value from 0, 100 (base 100) corresponding
        // to the player's new position
        // Base 6 to base 10
        // i = cols j = rows
        let currentPosition = p1.position;
        // The idea is to parse the digits of any number 0-99, the first digit is the col, the second is the row
        let col = p1.position % 10; // The last digit is the col
        let row = floor(p1.position / 10); // The rest is the number and also the row
        console.log("Moved to new col: " + col);
        console.log("Moved to new row: " + row);        
        // Check the new position's cell: does it have a ladder or a snake?
        if(board[col][row].ladder){
            console.log("We landed on a ladder");
            board[col][row].applyLadder(player);
        }
        if(board[col][row].snake) {
            console.log("We landed on a snake");
            board[col][row].applySnake(player);
        }
        // Update the x, y position for display
        p1.y = board[col][row].y;
        p1.x = board[col][row].x;
        // Check if won
        if(p1.position === 0) {
            alert("Player 1 Won!");
        }
    } else {
        p2.position -= moveValue;
        p2.position = constrain(p2.position, 0, 100);
        console.log(p2.position);
    }
}

/*
    showText
    Shows text ui.
*/
function showText(dice) {
    push();
    textSize(32);
    fill(255);
    text('Current player: ' + turn, 500, 50);
    text('Time Left: ', 1000, 50);
    text('Throw: ' + dice, 50, 50);
    pop();
}

/*
    draw()
    Display the game state in each frame. Includes player's position, ladders and snakes.
*/
function draw() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            board[i][j].show();
            if(board[i][j].getLadder()) {
                board[i][j].drawLadder("Ladder");
            }
            if(board[i][j].getLadderTop()) {
                board[i][j].drawLadder("Ladder top");
            }
            if(board[i][j].getSnake()) {
                board[i][j].drawSnake("Snake");
            }
            if(board[i][j].getSnakeBottom()) {
                board[i][j].drawSnake("Snake Bottom");
            }
        }
    }
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if(board[i][j].ladderTopCoords) {
                // Draw the line connecting them (to be replaced by a sprite)
                let x1 = board[i][j].x;
                let y1 = board[i][j].y;
                let x2 = board[i][j].ladderTopCoords.x;
                let y2 = board[i][j].ladderTopCoords.y;
                let offsetX = tileWidth/2;
                let offsetY = tileHeight/2;
                push();
                strokeWeight(15);
                stroke(random(125, 255), random(125, 255), random(255, 255), 105);
                line(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY);
                pop();
            }
            if(board[i][j].snakeCoords) {
                // Draw the line connecting them (to be replaced by a sprite)
                let x1 = board[i][j].x;
                let y1 = board[i][j].y;
                let x2 = board[i][j].snakeCoords.x;
                let y2 = board[i][j].snakeCoords.y;
                let offsetX = tileWidth/2;
                let offsetY = tileHeight/2;
                push();
                strokeWeight(15);
                stroke(random(0, 125), random(0, 125), random(0, 125), 105);
                line(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY);
                pop();
            }            
        }
    }
    // Update the player avatar display
    displayPlayer();    
}

/*
    setInterval
    Set interval for each player's turn taking.
*/
setInterval(() => {
   // changeTurns();
}, turnDuration);

/*
    mousePressed
    Player of the current turn throws a dice once, on mouse pressed.
*/
function mousePressed() {
    console.log(`Player ${turn} is throwing the dice: `);
    // Change turns if clicked
    changeTurns();
}

/*
    Cell
    The cell in each tile. Its data.
*/
function Cell(data) {
    this.i = data.i;
    this.j = data.j;
    this.x = data.x;
    this.y = data.y;
    this.w = data.width;
    this.h = data.height;
    this.color = data.color;
    this.snake = data.snake;
    this.snakeBottom = data.snakeBottom;
    this.snakeCoords = null; // Waiting to be associated in placeLadders()
    this.ladder = data.ladder;
    this.ladderTop = data.ladderTop;
    this.ladderTopCoords = null; // Waiting to be associated in placeLadders()
    return this;
}

Cell.prototype.getCell = function () {
    return this;
}

/*
    show()
    Displays cells and grid positions.
*/
Cell.prototype.show = function () {
    stroke(0);
    fill(this.color);
    rect(this.x, this.y, this.w, this.h);
    fill(255);
    text(this.j + ", " + this.i, this.x + this.w/3, this.y + this.h/2);
}

/*
    getLadder()
    Gets a cell's ladder if it exists.
*/
Cell.prototype.getLadder = function () {
    return this.ladder;
}

Cell.prototype.getLadderTop = function () {
    return this.ladderTop;
}

/*
    setLadder()
    Set a ladder to a value.
*/
Cell.prototype.setLadder = function (value) {
    this.ladder = value;
}

Cell.prototype.setLadderTop = function (value) {
    this.ladderTop = value;
}

Cell.prototype.getSnake = function () {
    return this.snake;
}

Cell.prototype.getSnakeBottom = function () {
    return this.snakeBottom;
}

Cell.prototype.setSnakeBottom = function (value) {
    this.snakeBottom = value;
}

/*
    drawLadder()
    Draw ladders.
*/
Cell.prototype.drawLadder = function (message) {
    stroke(1);
    fill(0);
    ellipse(this.x + this.w/2, this.y + this.h/2, this.w, this.w);
    textSize(24);
    fill(255);
    text(message, this.x + this.w/5, this.y + this.h/2);
}

/*
    drawSnake()
    Draw snakes.
*/
Cell.prototype.drawSnake = function (message) {
    stroke(1);
    fill(255,0,0);
    ellipse(this.x + this.w/2, this.y + this.h/2, this.w, this.w);
    textSize(24);
    fill(255);
    text(message, this.x + this.w/5, this.y + this.h/2);
}

/**
    applyLadder()
    Applies a vertical movement bonus typical of a ladder.
*/
Cell.prototype.applyLadder = function(player) {
    if(player === 1) {
        // Update the position for the image
        p1.x = this.ladderTopCoords.x;
        p1.y = this.ladderTopCoords.y;
        // Update the movement position value 
        let newPos = this.ladderTopCoords.row * 10 + this.ladderTopCoords.col; 
        console.log(newPos);
        p1.position = newPos;
    }
}

/**
    applySnake()
    Applies a vertical movement malus typical of a snake.
*/
Cell.prototype.applySnake = function(player) {
    if(player === 1) {
        // Update the position for the image
        p1.x = this.snakeCoords.x;
        p1.y = this.snakeCoords.y;
        // Update the movement position value 
        let newPos = this.snakeCoords.row * 10 + this.snakeCoords.col; 
        p1.position = newPos;
        console.log(p1.position);
    }
}