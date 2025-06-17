export interface Position {
	x: number;
	y: number;
}

export interface Velocity {
	dx: number;
	dy: number;
}

export interface Paddle {
	position: Position;
	width: number;
	height: number;
	speed: number;
}

export interface Ball {
	position: Position;
	radius: number;
	velocity: Velocity;
	initialSpeed: number;
}

// type named GameStatus declared- any variable of type GameStatus 
// can only have one of these four specific string values 
export type GameStatus = 'waiting' | 'running' | 'paused' | 'ended';

// format reference: if (gameState.status === GameStatus.RUNNING)
export const GameStatus = {
	WAITING: 'waiting' as GameStatus,
	RUNNING: 'running' as GameStatus,
	PAUSED: 'paused' as GameStatus,
	ENDED: 'ended' as GameStatus
} as const;

export interface GameState {
	status: GameStatus;
	leftPaddle: Paddle;
	rightPaddle: Paddle;
	ball: Ball;
	leftScore: number;
	rightScore: number;
	canvasWidth: number;
	canvasHeight: number;
}

export const Controls = {
	leftPaddle: {
		up: 'w',
		down: 's'
	},
	rightPaddle: {
		up: 'ArrowUp',
		down: 'ArrowDown'
	}
};

export const DEFAULT_GAME_SETTINGS = {
	paddleWidth: 40,
	paddleHeight: 100,
	paddleSpeed: 10,
	ballRadius: 20,
	ballInitialSpeed: 5,
	maxScore: 10
};

// create initial game state
export const createInitialGameState = (
	width: number,
	height: number
	): GameState => {
	const paddleHeight = DEFAULT_GAME_SETTINGS.paddleHeight;
	const paddleWidth = DEFAULT_GAME_SETTINGS.paddleWidth;
	const paddleOffset = 20; // distance from edge of canvas

	return {
	status: GameStatus.WAITING,
	canvasWidth: width,
	canvasHeight: height,
	leftScore: 0,
	rightScore: 0,
	leftPaddle: {
		position: {
			x: paddleOffset,
			y: height / 2 - paddleHeight / 2
		},
		width: paddleWidth,
		height: paddleHeight,
		speed: DEFAULT_GAME_SETTINGS.paddleSpeed
	},
	rightPaddle: {
		position: {
			x: width - paddleOffset - paddleWidth,
			y: height / 2 - paddleHeight / 2
		},
		width: paddleWidth,
		height: paddleHeight,
		speed: DEFAULT_GAME_SETTINGS.paddleSpeed
	},
	ball: {
		position: {
		x: width / 2,
		y: height / 2
		},
		radius: DEFAULT_GAME_SETTINGS.ballRadius,
		velocity: {
		dx: 0,
		dy: 0
	  },
	  initialSpeed: DEFAULT_GAME_SETTINGS.ballInitialSpeed
	}
	};
};

//resets ball to the center with random direction
export const resetBall = (gameState: GameState): GameState => {
	// shallow cloning the current state
	const newState: GameState = { ...gameState };

	// reset ball position to center
	newState.ball.position = {
		x: gameState.canvasWidth / 2,
		y: gameState.canvasHeight / 2
	};

	//set a random direction for the ball
	const angle = (Math.random() * Math.PI / 4) - Math.PI / 8; // random playable angle between -22.5° and 22.5°
	const direction = Math.random() < 0.5 ? 1 : -1; // randomly choose left or right direction

	// set ball velocity with the initial speed
	newState.ball.velocity = {
		dx: Math.cos(angle) * direction * gameState.ball.initialSpeed,
		dy: Math.sin(angle) * gameState.ball.initialSpeed
	};
	return newState;
};

// GAME RESULT for individual games
export interface GameResult {
	gameId: string;
	player1Id: number;
	player2Id: number;
	player1Score: number;
	player2Score: number;
	durationMs: number;
	isTournament: boolean;
	tournamentId?: string;
	tournamentRound?: 1 | 2 | 3;
	timestamp: Date;
	status: 'completed' | 'abandoned';
	winnerId?: number;
}

//array to store multiple game results
export type GameStatsTable = GameResult[];
  
export const createGameResult = (
	player1Id: number,
	player2Id: number,
	player1Score: number,
	player2Score: number,
	durationMs: number,
	isTournament: boolean = false,
	tournamentId?: string,
	tournamentRound?: 1 | 2 | 3
): GameResult => {
	const winnerId = player1Score > player2Score ? player1Id : player2Id;
	
	return {
		gameId: `game-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
		player1Id,
		player2Id,
		player1Score,
		player2Score,
		durationMs,
		isTournament,
		tournamentId,
		tournamentRound,
		timestamp: new Date(),
		status: 'completed',
		winnerId
	};
  };