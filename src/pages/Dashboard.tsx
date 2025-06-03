import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useUser } from "../contexts/UserContext"
import PieCharts from "../components/PieCharts"
import AreaCharts from "../components/AreaCharts"
import MatchHistory from "../components/MatchHistory"

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
			<div className="profile-box basis-1/5 justify-between p-6 py-16">
				
				<div className="flex flex-col items-center">
					{previewUrl ? (
					<img
						src={previewUrl}
						alt="Avatar preview"
						className="bubble w-64 object-cover"
						/>
					) : (
					<div className="bubble w-64 bg-white bg-opacity-25"></div>
					)}
					
					<h1 className="pt-6 text-3xl uppercase">{user?.name}</h1>

					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						ref={fileInputRef}
						className="hidden"
						/>

					<button
						onClick={handleUploadClick}
						className="text-[#ffebe7b7] hover:text-white py-2"
						>
						{t("avatar")}
					</button>

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
