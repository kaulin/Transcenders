import GameContainer from '../components/game/GameContainer'

function LocalGame() {

	return (
		<div className="h-full pt-8">
			<div className="container mx-auto px-4">
				{/* Game */}
				<div className="flex justify-center">
					<GameContainer width={1000} height={800} />
				</div>
			</div>
		</div>
	)
}

export default LocalGame