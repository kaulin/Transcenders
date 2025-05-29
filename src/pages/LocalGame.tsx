import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GameContainer from '../components/game/GameContainer'

function LocalGame() {
	const { t } = useTranslation()

	return (
		<div className="min-h-screen pt-32 pb-8 z-10">
			<div className="container mx-auto px-4">
				{/* Back button */}
				<div className="mb-6">
					<Link 
						to="/" 
						className="inline-flex items-center text-bg_primary hover:text-bg_primary/80 font-medium"
					>
						← {t('back_to_home', 'Back to Home')}
					</Link>
				</div>

				{/* Game */}
				<div className="flex justify-center">
					<GameContainer width={1000} height={800} />
				</div>
			</div>
		</div>
	)
}

export default LocalGame