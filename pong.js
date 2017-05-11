"use strict";
var menu = document.getElementById("divMenu"),
	playArea = document.getElementById("divPlayArea"),
	pOneWinScreen = document.getElementById("divPlayerOneWinScreen"),
	pTwoWinScreen = document.getElementById("divPlayerTwoWinScreen");
function pageLoad () {
	menu.style.display = "block";
	playArea.style.display = "none";
	pOneWinScreen.style.display = "none";
	pTwoWinScreen.style.display = "none";
}

//Controller
var gameObject = (function () {

	//Game Objects
	class Paddle {
		constructor(xPos, yPos) {
			this.x_position = xPos; // position in pixels
			this.y_position = yPos; // position in pixels
			this.width = 5; // width in pixels
			this.height = 50; // height in pixels
			this.y_speed = 5;
			this.fillStyle;
		}

		render() {
			context.fillRect(this.x_position, this.y_position, this.width, this.height); // draw paddle
		}
	}

	class Ball {
		constructor() {
			this.x_speed = 2; //pixels per second (change to desired speed)
			this.y_speed = 2; //pixels per second (change to desired speed)
			this.ball_radius = 5; // pixels
			this.x_position = width * 0.5; // position in pixels
			this.y_position = height * 0.5; // position in pixels
		}

		render() {
			context.beginPath();
			context.arc(this.x_position, this.y_position, this.ball_radius, 0, Math.PI * 2); // draw ball
			context.fill();
		}
	}

	class Barrier {
		constructor(xPos, yPos) {
			this.width = width;
			this.height = 3;
			this.x_position = xPos;
			this.y_position = yPos;
		}

		render() {
			context.fillRect(this.x_position, this.y_position, this.width, this.height); // draw paddle
			//context.fillStyle = 'red';
		}
	}

	var BASE_DIFFICULTY = 15,
		canvas = document.getElementById('canvas'),
		context = canvas.getContext('2d'),
		continueGame = true,
		currentPlayer1Pos = 170,
		height = canvas.height,
		playerOneScore = 0,
		playerTwoScore = 0,
		playerSkill = 1,
		gameDifficulty = 0,
		rendered = 0,
		width = canvas.width,
		barrier_top = new Barrier(0, 30),
		barrier_bottom = new Barrier(0, 380),
		ball = new Ball(),
		player_1 = new Paddle(40, 0),
		player_2 = new Paddle(750, 0),
		api = {
			keyboard_input: keyboard_input,
			rerenderGameObjects: rerenderGameObjects,
			setDifficulty: setDifficulty,
			stop: stop,
			update: update
		};

	
	function checkScore() {
		if (playerOneScore > 5) {
			stop();
			playArea.style.display = "none";
			pOneWinScreen.style.display = "block";
		} else if (playerTwoScore > 5) {
			stop();
			playArea.style.display = "none";
			pTwoWinScreen.style.display = "block";
		}
		resetGame();
	}

	function keyboard_input(event) {
		if (event.keyCode == 38) { //Up arrow
			currentPlayer1Pos = currentPlayer1Pos - 10;
			if (currentPlayer1Pos < barrier_top.y_position) {
				currentPlayer1Pos = barrier_top.y_position;
			}
		}
		if (event.keyCode == 40) { //Down arrow
			currentPlayer1Pos = currentPlayer1Pos + 10;
			if (currentPlayer1Pos > barrier_bottom.y_position - player_1.height) {
				currentPlayer1Pos = barrier_bottom.y_position - player_1.height;
			}
		}

		if (event.keyCode == 27) { //Esc
			restartGame();
		}
	}

	function playerOneScored() {
		playerOneScore = playerOneScore + 1;
		checkScore();
	}

	function playerTwoScored() {
		playerTwoScore = playerTwoScore + 1;
		checkScore();
	}

	function rerenderGameObjects() {
		context.fillStyle = 'white'; // set colour of components within the canvas
		context.clearRect(0, 0, width, height); // clear the canvas
		context.font = "small-caps bold 20px arial";
		context.fillText(playerOneScore + " VS " + playerTwoScore, 380, 20);
		context.fillText("Press Escape to reset", 520, 20);
		
		context.fillStyle = 'green'; //set colour of players
		player_1.render();
		player_2.render();
		
		context.fillStyle = 'white'; //set colour of ball back to white
		ball.render();
		
		context.fillStyle = 'red'; //set colour of borders
		barrier_bottom.render();
		barrier_top.render();
	}

	function restartGame() {
		playerOneScore = 0;
		playerTwoScore = 0;
		ball.x_position = width / 2;
		ball.y_position = height / 2;
		ball.x_speed = 2;
		ball.y_speed = 2;
	}

	function resetGame() {
		ball.x_position = width * 0.5; // position in pixels
		ball.y_position = height * 0.5; // position in pixels
		ball.x_speed = 2;
		ball.y_speed = 2;
		playerSkill = BASE_DIFFICULTY;
	}

	function setDifficulty(difficulty) {
		gameDifficulty = Number(difficulty);
	}

	function stop() {
		continueGame = false;
	}

	function trackBall() {
		player_2.y_position = (ball.y_position - (player_2.height / 2)) + (playerSkill > 0 ? playerSkill : playerSkill *-1);
		if (player_2.y_position < barrier_top.y_position) {
			player_2.y_position = barrier_top.y_position;
		} else if (player_2.y_position > barrier_bottom.y_position - player_2.height) {
			player_2.y_position = barrier_bottom.y_position - player_2.height;
		}
	}

	function update() {
		//Player 1 movement
		player_1.y_position = currentPlayer1Pos;
		/*For testing difficulty scaling....*/ //player_1.y_position = ball.y_position - 10;

		//Player 2 movement and ball tracking
		trackBall();

		//Speed up the ball
		ball.x_position -= ball.x_speed;
		ball.y_position += ball.y_speed;

		//Check for goals
		if (ball.x_position > width) {
			playerOneScored();
		}
		if (ball.x_position < 0) {
			playerTwoScored();
		}

		//Check for barrier collisions
		if (ball.y_position - ball.ball_radius < barrier_top.y_position ||
			ball.y_position > barrier_bottom.y_position - ball.ball_radius) {
				ball.y_speed *= -1; // Invert the ball's y-direction
				playerSkill *= -1; //Invert which side of CPU player's paddle the ball will fail at.
		}

		//Check for PlayerOne's paddle collision with ball
		if (ball.x_position < (40 + ball.ball_radius) &&
			ball.y_position >= player_1.y_position &&
			ball.y_position <= (player_1.y_position + player_1.height)) {
				ball.x_speed *= -1.2;
				//PLayer skill detirmines how accurate the CPU is therefore,
				//the closer to 0, the harder it gets.
				playerSkill += (playerSkill < 0) ? (-BASE_DIFFICULTY + gameDifficulty) : (BASE_DIFFICULTY - gameDifficulty);
		}

		//Check for PlayerTwo's paddle collision with ball
		if (ball.x_position > (750 - ball.ball_radius) &&
			ball.y_position >= player_2.y_position &&
			ball.y_position <= (player_2.y_position + player_2.height)) {
				ball.x_speed *= -1.2;
		}

		if (continueGame) {
			gameObject.rerenderGameObjects();
			window.requestAnimationFrame(update); //ask browser to call this function again, when it's ready	
		}
	}

	return api;
}());

//StartGame
function StartGame(difficulty) {
	menu.style.display = "none";
	playArea.style.display = "block";
	
	gameObject.setDifficulty(difficulty)
	gameObject.rerenderGameObjects();
	gameObject.update(); //update the game based on elapsed time

}

window.addEventListener("keydown", gameObject.keyboard_input); // listen to keyboard button press

//dick
