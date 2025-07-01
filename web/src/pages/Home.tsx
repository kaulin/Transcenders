import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from "react"

import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { usePlayers } from "../contexts/PlayersContext"
import PlayerLoginForm from "../components/PlayerLoginForm"
import curiousCat from "/images/curiousCat.avif"

const Home = () => {
    const { t } = useTranslation()
    const { user } = useUser()
	const { players, setPlayer } = usePlayers()

	const boxRef = useRef<HTMLDivElement | null>(null)
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

	const handleGameMode = (mode: "match" | "tournament") => {
		setGameMode(mode)

		if (window.innerWidth < 1024 && boxRef.current) {
			boxRef.current.scrollTo({
				top: boxRef.current.scrollHeight,
				behavior: 'smooth',
			})
		}
	}

    return (
		<div className="relative w-full h-full">
			<div ref={boxRef} className="profile-box bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat relative">
				<div className="flex flex-col lg:flex-1 flex-shrink-0 w-full h-full p-10 items-center justify-center text-center">
					<h1 className="text-6xl font-fascinate">{t('hello')} {user?.username}</h1>
					<p className="mb-10 text-xl">{t('welcome')}!</p>

					<div className="flex flex-col">
						<button
							onClick={() => handleGameMode("match")}
							className="profile-button"
						>
							{t('start_match')}
						</button>

						<button
							onClick={() => handleGameMode("tournament")}
							className="profile-button"
						>
							{t('start_tournament')}
						</button>
					</div>

				</div>

				<div className="relative flex flex-col lg:flex-1 flex-shrink-0 min-h-[1048px] w-full h-full px-10 items-center justify-center gap-2">
					{gameMode === "match" && (
						<div className="w-full h-full max-w-[826px] bg-[#6e5d41]/15 border border-white flex flex-col items-center justify-center gap-6 overflow-y-auto min-h-0">
								<div className="w-full max-w-[384px] h-[174px] p-4">
									<h2 className="profile-label mb-3">{t('player')} 1</h2>
									<p className="border-b-2 border-white text-lg flex justify-between">{user?.username}</p>
									<p className="flex justify-end text-lg mt-2 p-2">✓</p>
								</div>
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<PlayerLoginForm
									playerNumber={2}
									player={players[2]}
								/>
							</div>
						</div>
					)}

					{gameMode === "tournament" && (
						<div className="w-full h-full max-w-[826px] bg-[#6e5d41]/15 border border-white flex flex-col items-center justify-center gap-6 overflow-y-auto min-h-0">
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<h2 className="profile-label mb-3">{t('player')} 1</h2>
								<p className="border-b-2 border-white text-lg flex justify-between">{user?.username}</p>
								<p className="flex justify-end text-lg mt-2 p-2">✓</p>
							</div>
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<PlayerLoginForm
									playerNumber={2}
									player={players[2]}
								/>
							</div>
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<PlayerLoginForm
									playerNumber={3}
									player={players[3]}
								/>
							</div>
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<PlayerLoginForm
									playerNumber={4}
									player={players[4]}
								/>
							</div>
						</div>
					)}
					<div className="absolute bottom-[160px]">
						{gameMode === "tournament" && players[2]?.ready && players[3]?.ready && players[4]?.ready && (
							<Link to="/TournamentPage" className="profile-button mt-0 w-[400px]">start</Link>
						)}

						{gameMode === "match" && players[2]?.ready &&(
							<Link to="/MatchPage" className="profile-button">start</Link>
						)}
					</div>
				</div>

			</div>
			<img
				src={curiousCat}
				alt="curiousCat"
				className="absolute left-0 bottom-0 translate-y-[41%] w-[300px] sm:w-[350px] lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
	)
}

export default Home