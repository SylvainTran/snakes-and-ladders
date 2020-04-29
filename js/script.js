"use strict";

/*****************

Campfire Snakes and Ladders
Sylvain Tran

This is a simple variation on Snakes and Ladders (the board game).
28-04-2020

******************/

let p1 = {
    position: 0,
    x: 0,
    y: 0,
    color: '#003d17'
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

/*
    preload
    preloads assets
*/
function preload() {

}


/*
    setup
    setup canvas
*/
function setup() {
    // Create the canvas
    let game = createCanvas(1280, 720);
    game.parent('game__container');
}

/*
    changeTurns
    change turns from p1 to p2 and vice-versa
*/
function changeTurns() {
    if(turn === 1) {
        // then change to 2
        turn = 2;
        // Throw the dice (ints 1-6)
        let dice = Math.floor(random(1, 7));
        background(p2.color); // Background is red for p2
        showText(dice);      
    } else {
        turn = 1;
        let dice = Math.floor(random(1, 7));
        background(p1.color); // Background is green for p1
        showText(dice);      
    }
}

/*
    showText
    shows ui
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
    Description of draw()
*/
function draw() {

}

/*
    setInterval
    Set interval for each player's turn taking
*/
setInterval( ()=> {
   changeTurns();
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