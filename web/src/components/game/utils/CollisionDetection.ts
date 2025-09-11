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
  const closestX = Math.max(
    paddle.position.x,
    Math.min(ballCenterX, paddle.position.x + paddle.width),
  );
  const closestY = Math.max(
    paddle.position.y,
    Math.min(ballCenterY, paddle.position.y + paddle.height),
  );

  //get distance between the closest point and the ball's center
  //pythagorean theorum gives us the hypotenuse/angle we want b/w the ball and the point on paddle
  const distanceX = ballCenterX - closestX;
  const distanceY = ballCenterY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // if the distance is less than the ball's radius squared, reutrns true for a collision
  return distanceSquared <= ball.radius * ball.radius;
};

const handlePaddleHit = (gameState: GameState, paddle: Paddle, side: 'left' | 'right') => {
  const { ball } = gameState;

  // get the collision point
  const ballX = ball.position.x;
  const ballY = ball.position.y;

  // Find closest point on paddle to ball center
  const closestX = Math.max(paddle.position.x, Math.min(ballX, paddle.position.x + paddle.width));
  const closestY = Math.max(paddle.position.y, Math.min(ballY, paddle.position.y + paddle.height));

  // Calculate collision normal
  let normalX = ballX - closestX;
  let normalY = ballY - closestY;

  // Normalize the collision normal
  const length = Math.sqrt(normalX * normalX + normalY * normalY);
  if (length > 0) {
    normalX /= length;
    normalY /= length;
  }
  // Check if this is a corner hit by seeing if both X and Y normals are significant
  const isCornerHit = Math.abs(normalX) > 0.1 && Math.abs(normalY) > 0.1;

  if (isCornerHit) {
    // For corner hits, use predictable reflection that ensures good angles
    const paddleCenterY = paddle.position.y + paddle.height / 2;
    const hitPosition = (ballY - paddleCenterY) / (paddle.height / 2);
    const clampedHit = Math.max(-0.8, Math.min(0.8, hitPosition));
    
    // Create a new velocity that ensures good gameplay angles
    const speed = Math.sqrt(ball.velocity.dx * ball.velocity.dx + ball.velocity.dy * ball.velocity.dy);
    const newDirection = side === 'left' ? 1 : -1;
    
    // Ensure minimum angle to prevent shallow bounces
    const minAngle = Math.PI / 6; // 30 degrees minimum
    const angle = clampedHit * (Math.PI / 4); // up to 45 degrees based on hit position
    const finalAngle = Math.sign(angle) * Math.max(Math.abs(angle), minAngle);
    
    gameState.ball.velocity.dx = Math.cos(finalAngle) * newDirection * speed;
    gameState.ball.velocity.dy = Math.sin(finalAngle) * speed;
  } else {
    // Reflect the ball's velocity using the collision normal
    const dotProduct = ball.velocity.dx * normalX + ball.velocity.dy * normalY;
    gameState.ball.velocity.dx -= 2 * dotProduct * normalX;
    gameState.ball.velocity.dy -= 2 * dotProduct * normalY;
  }

  // Move ball to just outside the paddle
  const pushDistance = ball.radius + 1;
  gameState.ball.position.x = closestX + normalX * pushDistance;
  gameState.ball.position.y = closestY + normalY * pushDistance;

  gameState.ball.velocity.dx *= 1.05; //increasing speed of ball by 5%
  gameState.ball.velocity.dy *= 1.05;
};

export const handlePaddleCollisions = (gameState: GameState): GameState => {
  const { ball, leftPaddle, rightPaddle } = gameState;
  const newState = { ...gameState };

  if (ball.velocity.dx < 0 && checkPaddleCollision(ball, leftPaddle)) {
    handlePaddleHit(newState, leftPaddle, 'left');
  } else if (ball.velocity.dx > 0 && checkPaddleCollision(ball, rightPaddle)) {
    handlePaddleHit(newState, rightPaddle, 'right');
  }
  return newState;
};

export const checkScore = (
  gameState: GameState, 
  previousBallX: number
): { newState: GameState; scored: boolean } => {
  const { ball, canvasWidth, leftScore, rightScore } = gameState;
  const newState = { ...gameState };
  let scored = false;

  const currentBallX = ball.position.x;
  const ballRadius = ball.radius;

  // check if ball crossed left boundary during this frame
  const ballLeftEdge = currentBallX - ballRadius;
  const ballRightEdge = currentBallX + ballRadius;
  const prevBallLeftEdge = previousBallX - ballRadius;
  const prevBallRightEdge = previousBallX + ballRadius;

  // Left goal: check if ball crossed from positive to negative (or was already past)
  if ((prevBallLeftEdge > 0 && ballLeftEdge <= 0) || ballLeftEdge <= 0) {
    newState.rightScore = rightScore + 1;
    scored = true;
  }
  // Right goal: check if ball crossed from left side to past right boundary
  else if ((prevBallRightEdge < canvasWidth && ballRightEdge >= canvasWidth) || ballRightEdge >= canvasWidth) {
    newState.leftScore = leftScore + 1;
    scored = true;
  }

  return { newState, scored };
};