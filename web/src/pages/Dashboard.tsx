import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import { useUser } from "../contexts/UserContext"
import type { User} from "../contexts/UserContext"
import { ApiClient } from "@transcenders/api-client"
// import PieCharts from "../components/PieCharts"
// import AreaCharts from "../components/AreaCharts"
import MatchHistory from "../components/MatchHistory"

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useUser()

	const [avatarIdx, setAvatarIdx] = useState<number>(0)

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
	const [error, setError] = useState("")

	const handleSearch = async () => {
		setError("")
		const id = parseInt(searchId)

		try {
			const response = await ApiClient.user.getUserById(id)
			
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
		<div className="w-full h-full flex gap-10">
			<div className="profile-box rounded-lg basis-1/5 px-24 py-16">
				
				<div className="flex basis-4/12 flex-col items-center">
					<div className="bubble bg-opacity-50 w-64 h-64 flex items-end justify-center overflow-hidden">
						<img
						src={avatars[avatarIdx]}
						alt="Avatar preview"
						className="bubble w-64 object-cover"
						/>
					) : (
					<div className="bubble w-64 bg-white bg-opacity-25"></div>
					)}
					
					<h1 className="pt-6 text-5xl text-[#fff] font-fascinate">{viewedUser?.username}</h1>
				</div>

					{user?.id === viewedUser?.id ? (
						<>
						<div className="flex basis-7/12 w-full flex-col items-center justify-center">
							<div className="w-full h-[85%] bg-white/20 rounded-full border border-white p-10 custom-scrollbar">
								<p className="pb-2 text-white text-center font-fascinate uppercase text-xl mb-4">Friends</p>
								<div className="relative h-[80%] p-2 overflow-y-auto">
									{friends.map((friend) => (
										<div key={friend.id} className="flex items-center justify-between text-white py-1">
											<span>{friend.name}</span>
											<span
												className={`w-3 h-3 rounded-full ${
													friend.online ? 'bg-green-300' : 'bg-gray-200'
												}`}
											></span>
										</div>
									))}
								</div>
							</div>
						</div>
						</>
					) : (
						<div className="flex basis-7/12 w-full flex-col items-center">
							<div className="flex flex-col pt-16">
								<button className="play-button min-w-36 m-2">{t('add_friend')}</button>
								<button className="play-button min-w-36 m-2">{t('remove_friend')}</button>
								<button className="play-button min-w-36 m-2">{t('block_user')}</button>
							</div>
						</div>
					)}
	
				<div className="flex basis-1/12 w-full justify-center items-end">
					<input
						type="text"
						value={searchId}
						placeholder={t('username')}
						onChange={(e) => setSearchId(e.target.value)}
						className="login-input-field min-w-24 p-2"
					/>
					<button onClick={handleSearch} className="ml-4 p-2">Search</button>
				</div>
			</div>
			
			<div className="profile-box basis-3/5 gap-6 p-6 pt-16">
				<h1 className="flex w-full basis-1/12 justify-center text-3xl uppercase">
					{t('games_played')}
				</h1>
				
				<div className="flex basis-3/12 w-full justify-around items-center rounded-lg bg-[#f6dfd148] text-xl uppercase">
					<div className="flex flex-col">
						<div>{t('total')}</div>
						<div className="text-center">{wins + losses}</div>
					</div>
					<div className="flex flex-col">
						<div>{t('wins')}</div>
						<div className="text-center">{wins}</div>
					</div>
					<div className="flex flex-col">
						<div>{t('losses')}</div>
						<div className="text-center">{losses}</div>
					</div>
				</div>

				<div className="flex basis-4/12 items-center w-full rounded-lg bg-[#f6dfd148]">
					<PieCharts />
				</div>

				<div className="flex basis-4/12 items-center w-full rounded-lg bg-[#f6dfd148]">
					<AreaCharts />
				</div>
			</div>

			<div className="profile-box basis-1/5 p-6 pt-16">
				<h1 className="flex text-3xl mb-16 uppercase">
					{t('history')}
				</h1>
				<MatchHistory />
			</div>
		</div>
  );
}

export default Dashboard
