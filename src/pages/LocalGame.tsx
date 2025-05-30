import GameContainer from '../components/game/GameContainer'

function LocalGame() {

	return (
		<div className="min-h-screen pt-32 pb-8 z-10">
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