import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useUser } from "../contexts/UserContext"
// import PieCharts from "../components/PieCharts"
// import AreaCharts from "../components/AreaCharts"
import MatchHistory from "../components/MatchHistory"

import curiousCat from "/images/curiousCat.avif"
import avatarCat1 from "/images/avatarCat1.avif"
import avatarCat2 from "/images/avatarCat2.avif"
import avatarCat3 from "/images/avatarCat3.avif"
import avatarCat4 from "/images/avatarCat4.avif"
import avatarCat5 from "/images/avatarCat5.avif"

const avatars = [avatarCat1, avatarCat2, avatarCat3, avatarCat4, avatarCat5]

const Dashboard = () => {
	const { t } = useTranslation()
	const { user } = useUser()

	const [avatarIdx, setAvatarIdx] = useState<number>(0)
	const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])

	const nextAvatar = () => {
		setAvatarIdx((prev) => (prev + 1) % avatars.length)
	}

	const prevAvatar = () => {
		setAvatarIdx((prev) => (prev - 1 + avatars.length) % avatars.length)
	}

	const selectAvatar = () => {
		setSelectedAvatar(avatars[avatarIdx])
	}

	const avatarSizes = [
		"max-w-[80%]",
		"max-w-[95%]",
		"max-w-[80%]",
		"max-w-[80%]",
		"max-w-[80%]",
	]

	const wins = 42
	const losses = 13

  	return (
		<div className="w-full h-full flex gap-10">
			<div className="profile-box rounded-lg basis-1/5 justify-between p-6 py-16">
				
				<div className="flex flex-col items-center">
					<div className="bubble bg-opacity-40 w-64 h-64 flex items-end justify-center overflow-hidden">
						<img
						src={avatars[avatarIdx]}
						alt="Avatar preview"
						className={`object-contain ${avatarSizes[avatarIdx]}`}
						/>
					</div>
					
					<h1 className="pt-6 text-5xl text-[#fff] font-fascinate">{user?.name}</h1>

					<p className="pt-4">Select an avatar</p>
					<div className="flex justify-center gap-4 pt-1">
						<button onClick={prevAvatar}>⟨</button>
						<button onClick={selectAvatar}>Select</button>
						<button onClick={nextAvatar}>⟩</button>
					</div>

					<div className="flex flex-col pt-16">
						<button className="play-button min-w-36 m-2">
							{t('add_friend')}
						</button>

						<button className="play-button min-w-36 m-2">
							{t('remove_friend')}
						</button>
						
						<button className="play-button min-w-36 m-2">
							{t('block_user')}
						</button>
					</div>
				</div>

				<div className="flex w-full justify-center items-center">
					<p className="text-lg pr-4">{t('search_user')}:</p>
					<input
						type="text"
						className="login-input-field"
					/>
				</div>
			</div>
			
			<div className="profile-box basis-3/5 gap-6 p-6">
				
				<div className="flex basis-1/5 w-full font-fascinate justify-around items-center text-lg uppercase">
					<p className="text-4xl text-[#fff]">{t('games_played')} </p>
				
					<div className="bubble w-40 flex flex-col border border-white justify-center items-center">
						<div className="text-[#fff]">{t('total')}</div>
						<div className="text-center text-[#fff]">{wins + losses}</div>
					</div>
					<div className="bubble w-40  border border-white flex flex-col justify-center items-center">
						<div className="text-[#fff]">{t('wins')}</div>
						<div className="text-center text-[#fff]">{wins}</div>
					</div>
					<div className="bubble w-40  border border-white flex flex-col justify-center items-center">
						<div className="text-[#fff]">{t('losses')}</div>
						<div className="text-center text-[#fff]">{losses}</div>
					</div>
				</div>

				<div className="flex basis-2/5 items-center w-full">
					{/* <PieCharts /> */}
				</div>

				<div className="flex basis-2/5 items-end w-full">
					{/* <AreaCharts /> */}
				</div>
				
				<img
					src={curiousCat}
					alt="curiousCat"
					className="absolute left-0 bottom-0 translate-y-[41%] w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
				/>
			</div>

			<div className="profile-box basis-1/5 p-6 pt-16">
				<h1 className="flex text-4xl text-[#fff] font-fascinate uppercase mb-16">
					{t('history')}
				</h1>
				<MatchHistory />
			</div>
		</div>
  );
}

export default Dashboard
