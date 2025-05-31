import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext";

function Profile() {
  const { t } = useTranslation()
  const { user } = useUser()

  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  return (
		<div className="w-full h-full z-10 flex p-11 pt-32 gap-6">
			<div className="profile-box px-4 pt-32">
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
				</div>
				
				<div>
					<h1 className="flex justify-center text-4xl uppercase">{user?.name}</h1>

					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						ref={fileInputRef}
						className="hidden"
						/>

					<button
						onClick={handleUploadClick}
						className="px-4 text-[#ffebe7b7] hover:text-white py-2"
						>
					{t("avatar")}
					</button>
				</div>
			</div>
			
			<div className="profile-box px-4 pt-16">
				<div>
					<h1 className="flex text-3xl uppercase">
					{t('games_played')}
					</h1>
					
					<div className="flex justify-between py-2 text-[#ffebe7b7]">
						<div className="flex flex-col">
							<div>{t('total')}</div>
							<div>0</div>
						</div>
						<div className="flex flex-col">
							<div>{t('wins')}</div>
							<div>0</div>
						</div>
						<div className="flex flex-col">
							<div>{t('losses')}</div>
							<div>0</div>
						</div>
					</div>
				</div>
			</div>

			<div className="profile-box px-4 pt-16">
				<h1 className="flex text-3xl uppercase">
					{t('history')}
					</h1>
			</div>
		</div>
  );
}

export default Profile
