import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'

// import sleepyCat from "/images/sleepyCat.avif"
// import standingCat from "/images/standingCat.avif"

function Home() {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
		<div className="flex h-full flex-col justify-center items-center pb-28">
			<h1 className="text-6xl font-fascinate">{t('hello')} {user?.name}</h1>
			<p className="mb-10">{t('welcome')}!</p>

			<div className="flex flex-col">
				<Link to="/LocalGame" className="play-button">{t('start_match')}</Link>

				<button className="play-button">{t('start_tournament')} </button>
			</div>
			{/* <img
			src={sleepyCat}
			alt="sleepyCat"
			className="absolute left-0 bottom-0 w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/>

			<img
			src={standingCat}
			alt="standingCat"
			className="absolute bottom-0 right-0 translate-y-[4%] -translate-x-[70%] w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/> */}
		</div>
	)
}

export default Home
