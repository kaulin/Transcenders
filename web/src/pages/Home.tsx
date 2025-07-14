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

		if (window.innerWidth < 1300 && boxRef.current) {
			boxRef.current.scrollTo({
				top: boxRef.current.scrollHeight,
				behavior: 'smooth',
			})
		}
	}

    return (
		<div className="relative w-full h-full">
			<div ref={boxRef} className="box relative">
				<div className="flex flex-col xl:flex-1 flex-shrink-0 w-full h-full p-10 items-center justify-center text-center bg-[#6e5d41]/15 xl:bg-transparent">
					<h1 className="text-6xl font-fascinate">{t('hello')} {user?.username}</h1>
					<p className="mb-10 text-xl">{t('welcome')}!</p>

					<div className="flex flex-col">
						<button
							onClick={() => handleGameMode("match")}
							className="rounded-button bg-[#6e5d41]/15 font-fascinate uppercase mt-6"
						>
							{t('start_match')}
						</button>

						<button
							onClick={() => handleGameMode("tournament")}
							className="rounded-button bg-[#6e5d41]/15 font-fascinate uppercase mt-6"
						>
							{t('start_tournament')}
						</button>
					</div>
				</div>

				<div className="relative flex flex-col xl:flex-1 flex-shrink-0 min-h-[1048px] w-full h-full items-center justify-center gap-2 bg-[#6e5d41]/15 xl:bg-transparent">
					{gameMode === "match" && (
						<div className="box-section xl:bg-[#6e5d41]/15 justify-center xl:max-w-[790px]">
								<div className="w-full max-w-[384px] h-[174px] p-4">
									<h2 className="fascinate-label mb-3">{t('player')} 1</h2>
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
						<div className="box-section xl:bg-[#6e5d41]/15 justify-center xl:max-w-[790px]">
							<div className="w-full max-w-[384px] h-[174px] p-4">
								<h2 className="fascinate-label mb-3">{t('player')} 1</h2>
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
					<div className="absolute bottom-[130px]">
						{gameMode === "tournament" && players[2]?.ready && players[3]?.ready && players[4]?.ready && (
							<Link to="/TournamentPage" className="rounded-button bg-[#6e5d41]/15 font-fascinate uppercase">start</Link>
						)}

						{gameMode === "match" && players[2]?.ready &&(
							<Link to="/MatchPage" className="rounded-button bg-[#6e5d41]/15 font-fascinate uppercase">start</Link>
						)}
					</div>
				</div>

			</div>

			<img
				src={curiousCat}
				alt="curiousCat"
				className="absolute left-0 bottom-0 translate-y-[40.5%] translate-x-[0.5%] w-[250px] sm:w-[325px] lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
	)
}

export default Home