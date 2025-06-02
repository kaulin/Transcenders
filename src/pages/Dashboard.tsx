import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useUser } from "../contexts/UserContext"
import PieCharts from "../components/PieCharts"
import AreaCharts from "../components/AreaCharts"

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useUser()

  const [avatar, setAvatar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const wins = 42
  const losses = 13

  return (
		<div className="w-full h-full flex gap-6">
			<div className="profile-box basis-1/5 justify-between px-4 py-16">
				
				<div>
					{previewUrl ? (
					<img
						src={previewUrl}
						alt="Avatar preview"
						className="bubble w-64 object-cover"
						/>
					) : (
					<div className="bubble w-64 bg-white bg-opacity-25"></div>
					)}
					
					<h1 className="flex justify-center pt-6 text-3xl uppercase">{user?.name}</h1>

					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						ref={fileInputRef}
						className="hidden"
						/>

					{/* <button
						onClick={handleUploadClick}
						className="px-4 text-[#ffebe7b7] hover:text-white py-2"
						>
					{t("avatar")}
					</button> */}
				<div className="flex flex-col pt-16">
					<button className="play-button min-w-36 m-2">
						Add Friend
					</button>

					<button className="play-button min-w-36 m-2">
						Remove Friend
					</button>
					
					<button className="play-button min-w-36 m-2">
						Block User
					</button>
				</div>
				</div>

				

				<div className="flex w-full justify-center items-center">
					<p className="text-lg pr-4">Search User:</p>
					<input
						type="text"
						className="login-input-field"
				/>
				</div>
			</div>
			
			<div className="profile-box w-full basis-3/5 px-4 pt-16">
				<h1 className="flex justify-center mb-16 text-3xl uppercase">
					{t('games_played')}
				</h1>
				
				<div className="flex flex-col w-full rounded-lg bg-[#f6dfd148] p-4">
					<div className="flex justify-around py-6 text-xl uppercase">
						<div className="flex flex-col">
							<div>{t('total')}</div>
							<div className="text-center">55</div>
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
				</div>

				<div className="flex w-full rounded-lg bg-[#f6dfd148] p-10 mt-10">
					<PieCharts wins={wins} losses={losses} />
				</div>

				<div className="flex w-full rounded-lg bg-[#f6dfd148] p-10 mt-10">
					<AreaCharts />
				</div>
			</div>

			<div className="profile-box basis-1/5 px-4 pt-16">
				<h1 className="flex text-3xl mb-16 uppercase">
					{t('history')}
				</h1>
				<div className="flex flex-col w-full gap-8">
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>Win</div>
						<div>User 11 - 2 AnotherUser</div>
						<div>24/5/2025</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>Loss</div>
						<div>User 7 - 11 AnotherUser</div>
						<div>24/5/2025</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>win</div>
						<div>User 11 - 6 AnotherUser</div>
						<div>24/5/2025</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>Loss</div>
						<div>User 5 - 11 AnotherUser</div>
						<div>24/5/2025</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>Win</div>
						<div>User 11 - 9 AnotherUser</div>
						<div>24/5/2025</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>-</div>
						<div>No data available</div>
						<div>-</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>-</div>
						<div>No data available</div>
						<div>-</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>-</div>
						<div>No data available</div>
						<div>-</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>-</div>
						<div>No data available</div>
						<div>-</div>
					</div>
					<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center gap-4">
						<div>-</div>
						<div>No data available</div>
						<div>-</div>
					</div>
				</div>
			</div>
		</div>
  );
}

export default Dashboard
