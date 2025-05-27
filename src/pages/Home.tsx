import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"

function Home() {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
		<div className="pb-24 z-10">
			<h1 className="text-4xl">{t('hello')} {user?.name}</h1>
			<p className="mb-10">{t('welcome')}!</p>

			<div className="flex flex-col">
				<button className="play-button">
					{t('start_match')}
				</button>

				<button className="play-button">
					{t('start_tournament')}
				</button>
			</div>
		</div>
	)
}

export default Home
