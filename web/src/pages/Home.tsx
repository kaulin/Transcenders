import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'

function Home() {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
		<div className="flex h-full flex-col justify-center items-center pb-28">
			<h1 className="text-6xl font-fascinate">{t('hello')} {user?.username}</h1>
			<p className="mb-10">{t('welcome')}!</p>

			<div className="flex flex-col">
				<Link to="/LocalGame" className="play-button">{t('start_match')}</Link>

				<button className="play-button">{t('start_tournament')} </button>
			</div>
		</div>
	)
}

export default Home