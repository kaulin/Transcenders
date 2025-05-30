import type { GameState, Paddle, Ball } from '../models/GameState';

// check ball collision with top or bottom walls
export const checkWallCollision = (gameState: GameState): GameState => {
	const { ball, canvasHeight } = gameState;
	const newState = { ...gameState };

	// top wall
	if (ball.position.y - ball.radius <= 0) {
		newState.ball.position.y = ball.radius; // stop ball from going out of bounds
		newState.ball.velocity.dy = -newState.ball.velocity.dy; // Reverse vertical direction
	}
  
	//bottom wall
	if (ball.position.y + ball.radius >= canvasHeight) {
		newState.ball.position.y = canvasHeight - ball.radius;
		newState.ball.velocity.dy = -newState.ball.velocity.dy;
	}
	return newState;
};

// check ball/paddle collision
export const checkPaddleCollision = (ball: Ball, paddle: Paddle): boolean => {
	const ballCenterX = ball.position.x;
	const ballCenterY = ball.position.y;
  
	// get closest point on the paddle to the ball's center
	const closestX = Math.max(paddle.position.x, Math.min(ballCenterX, paddle.position.x + paddle.width));
	const closestY = Math.max(paddle.position.y, Math.min(ballCenterY, paddle.position.y + paddle.height));
  
	//get distance between the closest point and the ball's center
	//pythagorean theorum gives us the hypotenuse/angle we want b/w the ball and the point on paddle 
	const distanceX = ballCenterX - closestX;
	const distanceY = ballCenterY - closestY;
	const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  
	// if the distance is less than the ball's radius squared, reutrns true for a collision
	return distanceSquared <= (ball.radius * ball.radius);
};

export const handlePaddleCollisions = (gameState: GameState): GameState => {
	const { ball, leftPaddle, rightPaddle } = gameState;
	const newState = { ...gameState };

	if (checkPaddleCollision(ball, leftPaddle)) {
		//where on the paddle the ball hit (normalized from -1 to 1)
		const hitPosition = (ball.position.y - (leftPaddle.position.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
	
		// change ball position to be on the right side of the paddle to prevent getting stuck
		newState.ball.position.x = leftPaddle.position.x + leftPaddle.width + ball.radius;
	
		// Reverse horizontal direction and adjust angle based on where the ball hit the paddle
		newState.ball.velocity.dx = Math.abs(ball.velocity.dx); //positive dx = moving right
		newState.ball.velocity.dy = ball.initialSpeed * hitPosition; // Adjust vertical speed based on hit position
	
		//increase speed
		newState.ball.velocity.dx *= 1.05;
	}

	if (checkPaddleCollision(ball, rightPaddle)) {
		const hitPosition = (ball.position.y - (rightPaddle.position.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
	
		// change ball pos to be on the left side
		newState.ball.position.x = rightPaddle.position.x - ball.radius;
	
		// reverse direction and adjust angle based on where the ball hit the paddle
		newState.ball.velocity.dx = -Math.abs(ball.velocity.dx); // negative dx (moving left)
		newState.ball.velocity.dy = ball.initialSpeed * hitPosition; // Adjust vertical speed based on hit position
	
		// Slightly increase speed to make game progressively harder
		newState.ball.velocity.dx *= 1.05;
	}
	return newState;
};

// Check if a point is scored
export const checkScore = (gameState: GameState): { newState: GameState, scored: boolean } => {
	const { ball, canvasWidth, leftScore, rightScore } = gameState;
	const newState = { ...gameState };
	let scored = false;

	// if ball passes left edge, right player scores
	if (ball.position.x - ball.radius <= 0) {
		newState.rightScore = rightScore + 1;
		newState.rightScore = rightScore + 1;
		scored = true;
	}

	// if ball passes the right edge, left player scores
	if (ball.position.x + ball.radius >= canvasWidth) {
		newState.leftScore = leftScore + 1;
		scored = true;
	}
	return { newState, scored };
};