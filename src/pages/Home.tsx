import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom' //added

function Home() {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
		<div>
			<h1 className="text-4xl">{t('hello')} {user?.name}</h1>
			<p className="mb-10">{t('welcome')}!</p>

			<div className="flex flex-col">
				<button className="play-button">
					{t('start_match', 'Play Online Game')}
				</button>

				<button className="play-button">
					{t('start_tournament', 'Start Tournament')}
				</button>

				<Link to="/local-game">
				<button className="play-button">
					{t('play_local_game', 'Play Local Game')}
				</button>
				</Link>
			</div>
		</div>
	)
}

export default Home
