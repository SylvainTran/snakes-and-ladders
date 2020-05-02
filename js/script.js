"use strict";

/*****************

Campfire Snakes and Ladders
Sylvain Tran

This is a simple variation on Snakes and Ladders (the board game).
28-04-2020

******************/

let p1 = {
    position: 0, // the absolute movement value
    x: 0, // the mapped position x on the board
    y: 0, // ' ' y on the board
    color: '#003d17' // player's color
}

let p2 = {
    position: 0,
    x: 0,
    y: 0,
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
    placeLadders(board);
    // placeSnakes(board);
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
                color: color(random(0, 255), 0, random(0, 255)),
                snake: false,
                ladder: false
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
    // Create a ladder for each row
    for(let i = 0; i < rows; i++) {
        let ladder = floor(Math.random() * cols);
        ladderPositions.push(ladder);
    }
    console.log(ladderPositions)
    // Get in the board data and place the ladders at these positions except the last row at the top
    // Starting at i = 1 to skip the first row
    for(let i = 1; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            let ladder = ladderPositions[i];
            board[ladder][i].setLadder(true);    
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
        background(p2.color); // Background is red for p2
        showText(dice);
    } else {
        dice = Math.floor(random(1, 7));
        move(2, dice);
        turn = 1;
        background(p1.color); // Background is green for p1
        showText(dice);
    }
}

/*
    move
    Moves the player of the current turn by the value of the dice thrown this turn.
    constrained between 0, 100 (board size).
*/
function move(player, moveValue) {
    if (player === 1) {
        p1.position += moveValue;
        p1.position = constrain(p1.position, 0, 100);
        console.log(p1.position);
    } else {
        p2.position += moveValue;
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
                board[i][j].drawLadder();
            }
        }
    }
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
    this.ladder = data.ladder;
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

/*
    setLadder()
    Set a ladder to a value.
*/
Cell.prototype.setLadder = function (value) {
    this.ladder = value;
}

/*
    drawLadder()
    Draw ladders.
*/
Cell.prototype.drawLadder = function () {
    stroke(1);
    fill(0);
    ellipse(this.x + this.w/2, this.y + this.h/2, this.w, this.w);
    textSize(24);
    fill(255);
    text('Ladder', this.x + this.w/5, this.y + this.h/2);
}