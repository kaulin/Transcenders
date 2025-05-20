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
	<div className="flex w-full items-center grow">
		<div className="flex basis-2/5 justify-center items-center">
			<div>
				{previewUrl ? (
				<img
				src={previewUrl}
				alt="Avatar preview"
				className="bubble w-44 object-cover"
				/>
				) : (
				<div className="bubble w-44 bg-white bg-opacity-25"></div>
				)}
			</div>
			
			<div className="pl-6">
				<h1 className="flex justify-center text-4xl">{user?.name}</h1>

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
		
		<div className="flex basis-3/5 justify-center">
			<div>
				<h1 className="flex text-4xl">
				{t('games_played')} 0
				</h1>
				
				<div className="flex justify-evenly py-2 text-[#ffebe7b7]">
					<div>{t('wins')} 0</div>
					<div>{t('losses')} 0</div>
				</div>
			</div>
		</div>
	</div>
  );
}

export default Profile
