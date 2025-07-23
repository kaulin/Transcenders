import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
	HeartPlus,
	HeartMinus,
	HeartOff,
	Heart,
	HeartCrack,
	MailQuestionMark,
	ChevronRight,
	Trophy,
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
		<div className="box xl:gap-6">
			<div className="box-section bg-[#6e5d41]/10 justify-between">
				<div className="flex flex-col items-center">
					<div className="bubble bg-white/50 w-56 h-56 flex items-end justify-center overflow-hidden">
						<img
						src={avatars[0]}
						alt="Avatar"
						className={`object-contain ${avatarSizes[0]}`}
						/>
					</div>

					<h1 className="pt-6 text-5xl text-[#fff] font-fascinate">{viewedUser?.username}</h1>
				</div>

				<div className="w-full flex flex-col items-center justify-center">
					{user?.id === viewedUser?.id ? (
						<>
								<div className="w-80 h-[509px] p-10">
									<p className="text-[#fff] text-center font-fascinate uppercase text-xl mb-6">{t('friends')}</p>
									<div className="relative h-[80%] px-2 overflow-y-auto custom-scrollbar">
										{friends.map((friend) => (
											<div key={friend.id} className="flex items-center justify-between text-[#fff] py-1">
												<span>{friend.name}</span>
												<span
													className={`w-3 h-3 rounded-full border border-white ${
														friend.online ? 'bg-[#ceff5d]' : 'bg-transparent'
													}`}
												></span>
											</div>
										))}
									</div>
								</div>
						</>
					) : (
						<div className="flex flex-col h-[500px] justify-start p-10">
							<button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"><HeartPlus className="text-[#786647]"/>{t('add_friend')}</button>
							<button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"><HeartMinus className="text-[#786647]"/>{t('remove_friend')}</button>
							<button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"><HeartOff className="text-[#786647]"/>{t('block_user')}</button>
						</div>
					)}
				</div>

				<div className="flex w-full flex-col justify-start items-center">
					<div className="flex flex-col">
						<div className="flex">
							<input
								type="text"
								value={searchId}
								placeholder={t('search_user')}
								onChange={(e) => setSearchId(e.target.value)}
								className="input-field"
								/>
							<button onClick={handleSearch} className="ml-4 p-2 rounded-full  border-white hover:border-[#786647] bg-white/15 text-white"><ChevronRight /></button>
						</div>
						<div className="h-6 pt-2">
							{error && (
								<p className="flex justify-start text-[#786647] text-xs sm:text-sm">{error}</p>
								)}
						</div>
					</div>
				</div>
			</div>

			<div className="box-section bg-[#6e5d41]/10 justify-between gap-24">
				<div className="flex flex-col font-fascinate uppercase text-center">
					<p className="text-2xl text-[#fff] mb-2">{t('games_played')}</p>
					<div className="flex justify-between text-md">
						<p>{t('total')}</p>
						<p className="font-sans">{wins + losses}</p>
					</div>
					<div className="flex justify-between text-md">
						<p>{t('wins')}</p>
						<p className="font-sans">{wins}</p>
					</div>
					<div className="flex justify-between text-md">
						<p>{t('losses')}</p>
						<p className="font-sans">{losses}</p>
					</div>
				</div>

				<div className="flex w-full max-w-[400px]">
					<PieCharts />
				</div>

				<div className="flex flex-col items-center w-full">
					<p className="text-center text-[#fff] font-fascinate text-xl uppercase">Latest matches</p>
					<AreaCharts />
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex gap-2 items-center text-white">
							<div className="w-4 h-4 rounded-full bg-[#a7d4373c] border border-white"></div>
							Your Score
						</div>
						<div className="flex gap-2 items-center text-white">
							<div className="w-4 h-4 rounded-full bg-[#5d6b2f52] border border-white"></div>
							Opponent's Score
						</div>
					</div>
				</div>
			</div>
			
			<div className="box-section bg-[#6e5d41]/10 justify-between h-full">
				<p className="text-[#fff] text-center text-2xl font-fascinate uppercase">{t('history')}</p>
				<div className="relative w-80 h-[90%] px-4 overflow-y-auto custom-scrollbar">
					<MatchHistory />
				</div>
			</div>

		</div>
  )
}

export default Dashboard
