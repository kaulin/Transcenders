import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
	HeartPlus,
	HeartMinus,
	HeartOff,
	Heart,
	HeartCrack,
	MailQuestionMark,
} from 'lucide-react'

import { useUser } from "../contexts/UserContext"
import type { User} from "@transcenders/contracts"
import { ApiClient } from "@transcenders/api-client"
import PieCharts from "../components/PieCharts"
import AreaCharts from "../components/AreaCharts"
import MatchHistory from "../components/MatchHistory"

import avatarCat1 from "/images/avatarCat1.avif"
import avatarCat2 from "/images/avatarCat2.avif"
import avatarCat3 from "/images/avatarCat3.avif"
import avatarCat4 from "/images/avatarCat4.avif"
import avatarCat5 from "/images/avatarCat5.avif"
import avatarCat6 from "/images/avatarCat6.avif"

const avatars = [avatarCat1, avatarCat2, avatarCat3, avatarCat4, avatarCat5, avatarCat6]

const Dashboard = () => {
	const { t } = useTranslation()
	const { user } = useUser()

	const avatarSizes = [
		"max-w-[65%]",
		"max-w-[85%]",
		"max-w-[98%]",
		"max-w-[80%]",
		"max-w-[80%]",
		"max-w-[70%]",
	]

	const friends = [
		{ id: 1, name: "Mittens", online: true },
		{ id: 2, name: "Shadow", online: false },
		{ id: 3, name: "Whiskers", online: true },
		{ id: 4, name: "Mittens", online: true },
		{ id: 5, name: "Shadow", online: false },
		{ id: 6, name: "Whiskers", online: true },
		{ id: 7, name: "Mittens", online: true },
		{ id: 8, name: "Shadow", online: false },
		{ id: 9, name: "Whiskers", online: true },
		{ id: 10, name: "Mittens", online: true },
		{ id: 11, name: "Shadow", online: false },
		{ id: 12, name: "Whiskers", online: true },
		{ id: 13, name: "Mittens", online: true },
		{ id: 14, name: "Shadow", online: false },
		{ id: 15, name: "Whiskers", online: true },
	]

	const [viewedUser, setViewedUser] = useState<User | null>(user)
	const [searchId, setSearchId] = useState("")
	const [error, setError] = useState<string | null>(null)

	const handleSearch = async () => {
		setError(null)

		try {
      		const response = await ApiClient.user.getUserExact({ username: searchId })
			
			if (response?.success && response?.data) {
				setViewedUser(response.data as User)
			} else {
				setError("User not found")
			}

		} catch (err: any) {
			setError(err.message || t('something_went_wrong'))
		}
	}

	const wins = 42
	const losses = 13

  	return (
		<div className="profile-box lg:flex-wrap">
			{/* profile */}
			<div className="flex lg:flex-1 w-full min-h-full flex-col flex-shrink-0 lg:flex-shrink bg-[#605c4c13] items-center gap-14 px-8 py-16">
				<div className="flex basis-4/12 flex-col items-center">
					<div className="bubble bg-white/50 w-64 h-64 flex items-end justify-center overflow-hidden">
						<img
						src={avatars[0]}
						alt="Avatar"
						className={`object-contain ${avatarSizes[0]}`}
						/>
					</div>

					<h1 className="pt-6 text-5xl text-[#fff] font-fascinate">{viewedUser?.username}</h1>
				</div>

				<div className="flex basis-7/12 w-full flex-col items-center justify-center">
					{user?.id === viewedUser?.id ? (
						<>
								<div className="w-80 h-[535px] bg-[#605c4c13] rounded-full border border-white p-10 custom-scrollbar">
									<p className="pb-2 text-[#fff] text-center font-fascinate uppercase text-xl mb-4">Friends</p>
									<div className="relative h-[80%] p-2 overflow-y-auto">
										{friends.map((friend) => (
											<div key={friend.id} className="flex items-center justify-between text-[#fff] py-1">
												<span>{friend.name}</span>
												<span
													className={`w-3 h-3 rounded-full border ${
														friend.online ? 'bg-[#ceff5d]' : 'bg-[#d7d4cd00]'
													}`}
												></span>
											</div>
										))}
									</div>
								</div>
						</>
					) : (
						<div className="flex flex-col">
							<button className="play-button flex gap-3 min-w-48 justify-start m-2"><HeartPlus className="text-[#b15789c5]"/>{t('add_friend')}</button>
							<button className="play-button flex gap-3 min-w-48 justify-start m-2"><HeartMinus className="text-[#b15789c5]"/>{t('remove_friend')}</button>
							<button className="play-button flex gap-3 min-w-48 justify-start m-2"><HeartOff className="text-[#b15789c5]"/>{t('block_user')}</button>
						</div>
					)}
				</div>

				<div className="flex basis-1/12 w-full flex-col justify-start items-center">
					<div className="flex">
						<input
							type="text"
							value={searchId}
							placeholder={t('username')}
							onChange={(e) => setSearchId(e.target.value)}
							className="login-input-field min-w-24 p-2"
							/>
						<button onClick={handleSearch} className="ml-4 p-2">Search</button>
					</div>
					{error && (
						<p className="text-[#513838] pt-2">{error}</p>
					)}
				</div>
			</div>

			{/* stats */}
			<div className="flex lg:flex-1 w-full min-h-full flex-col gap-28 flex-shrink-0 lg:flex-shrink px-8 py-16">
		 		<div className="flex w-full justify-center text-center items-center text-lg font-fascinate uppercase">
		 			<p className="text-4xl text-[#fff]">{t('games_played')} </p>

		 		</div>		
		 		<div className="flex flex-col md:flex-row items-center justify-center gap-12 text-xl uppercase font-fascinate">
		 			<div className="bubble min-w-40 bg-[#605c4c13] border border-white flex flex-col justify-center items-center">
		 				<div className="text-[#fff]">{t('total')}</div>
		 				<div className="text-center text-[#fff]">{wins + losses}</div>
		 			</div>
		 			<div className="bubble min-w-40 bg-[#605c4c13] border border-white flex flex-col justify-center items-center">
		 				<div className="text-[#fff]">{t('wins')}</div>
		 				<div className="text-center text-[#fff]">{wins}</div>
		 			</div>
		 			<div className="bubble min-w-40 bg-[#605c4c13] border border-white flex flex-col justify-center items-center">
		 				<div className="text-[#fff]">{t('losses')}</div>
		 				<div className="text-center text-[#fff]">{losses}</div>
		 			</div>
		 		</div>
				 <div className="flex items-center justify-center gap-10">
		 			<PieCharts />
				</div>	
		 		<div className="flex items-end w-full">
		 			<AreaCharts />
		 		</div>
			</div>

			{/* match history */}
			<div className="flex lg:flex-1 w-full min-h-full flex-col flex-shrink-0 lg:flex-shrink bg-[#605c4c13] px-8 py-16">
				<h1 className="flex justify-center text-center text-4xl text-[#fff] font-fascinate uppercase mb-16">
					{t('history')}
				</h1>
				<MatchHistory />
			</div>

		</div>
  )
}

export default Dashboard
