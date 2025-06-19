import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"

import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { usePlayers } from "../contexts/PlayersContext"
import PlayerLoginForm from "../components/PlayerLoginForm"
import curiousCat from "/images/curiousCat.avif"

const Home = () => {
    const { t } = useTranslation()
    const { user } = useUser()
	const { players, setPlayer } = usePlayers()

	const [gameMode, setGameMode] = useState<"match" | "tournament" | null>(null)

	useEffect(() => {
		if (user?.id) {
			setPlayer(1, {
				id: user?.id,
				username: user?.username,
				avatar: user?.avatar,
				mode: "login",
				ready: true
			})
		}
	}, [user?.id, user?.username, user?.avatar])

    return (
		<div className="w-full h-full profile-box flex-row">
			<div className="h-full flex flex-col basis-1/2 p-10 items-center justify-center">
				<h1 className="text-6xl font-fascinate">{t('hello')} {user?.username}</h1>
				<p className="mb-10 text-xl">{t('welcome')}!</p>

				<div className="flex flex-col">
					<button
						onClick={() => setGameMode("match")}
						className="profile-button"
					>
						{t('start_match')}
					</button>

					<button
						onClick={() => setGameMode("tournament")}
						className="profile-button"
					>
						{t('start_tournament')}
					</button>
				</div>

			</div>

			<div className="h-full flex flex-col basis-1/2 px-10 gap-2 bg-[#605c4c13] items-center justify-center">
				{gameMode === "match" && (
					<div className="w-full h-full max-w-sm flex flex-col">
						<div className="flex basis-1/4 flex-col"></div>
						<div className="flex basis-1/4 flex-col justify-end pb-8">
							<h2 className="profile-label">{t('player')} 1</h2>
							<p className="mb-6 border-b-2 border-white text-lg flex justify-between">{user?.username}</p>
						</div>
						<div className="flex basis-1/4 flex-col justify-start">
							<PlayerLoginForm
								playerNumber={2}
								player={players[2]}
							/>
						</div>
						<div className="flex basis-1/4 items-center justify-center">
							{players[2]?.ready && (
								<Link to="/LocalGame" className="profile-button">start</Link>
							)}
						</div>
					</div>
				)}

				{gameMode === "tournament" && (
					<div className="w-full h-full max-w-sm flex flex-col">
						<div className="flex basis-1/6"></div>
						<div className="flex basis-1/6 flex-col justify-center">
							<h2 className="profile-label">{t('player')} 1</h2>
							<p className="mb-6 border-b-2 border-white pb-1 text-lg">{user?.username}</p>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm
								playerNumber={2}
								player={players[2]}
							/>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm
								playerNumber={3}
								player={players[3]}
							/>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm
								playerNumber={4}
								player={players[4]}
							/>
						</div>
						<div className="flex basis-1/6 items-center justify-center">
							{players[2]?.ready && players[3]?.ready && players[4]?.ready && (
								<Link to="/LocalGame" className="profile-button mt-0">start</Link>
							)}
						</div>
					</div>
				)}
			</div>

			<img
				src={curiousCat}
				alt="curiousCat"
				className="absolute left-0 bottom-0 translate-y-[41%] w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
	)
}

export default Home
