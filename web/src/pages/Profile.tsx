import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { ApiClient } from "@transcenders/api-client"

import avatarCat1 from "/images/avatarCat1.avif"
import avatarCat2 from "/images/avatarCat2.avif"
import avatarCat3 from "/images/avatarCat3.avif"
import avatarCat4 from "/images/avatarCat4.avif"
import avatarCat5 from "/images/avatarCat5.avif"
import avatarCat6 from "/images/avatarCat6.avif"

const avatars = [avatarCat1, avatarCat2, avatarCat3, avatarCat4, avatarCat5, avatarCat6]

const Profile = () => {
    const { t } = useTranslation()
    const { user } = useUser()

	const [avatarIdx, setAvatarIdx] = useState<number>(0)
	const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
	
	const navigate = useNavigate()

	const nextAvatar = () => {
		setAvatarIdx((prev) => (prev + 1) % avatars.length)
	}

	const prevAvatar = () => {
		setAvatarIdx((prev) => (prev - 1 + avatars.length) % avatars.length)
	}

	const selectAvatar = () => {
		setSelectedAvatar(avatars[avatarIdx])
	}

	useEffect(() => {
		const imgs = avatars.map((src) => {
			const img = new Image()
			img.src = src
			return img
		})
	}, [])

	const avatarSizes = [
		"max-w-[65%]",
		"max-w-[85%]",
		"max-w-[98%]",
		"max-w-[80%]",
		"max-w-[80%]",
		"max-w-[70%]",
	]

    const [username, setUsername] = useState(user?.username || "")
    const [displayName, setDisplayName] = useState(user?.display_name || "")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [language, setLanguage] = useState(user?.lang || "")
	const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setError(null)
        
        if (password !== confirmPassword) {
			setError(t('pw_no_match'))
			return
		}

        try {

        } catch (err) {

        }
    }

	const handleDelete = async () => {
		setError(null)

		try {
			if (user?.id == null) {
				throw new Error("User ID is undefined")
			}

			const response = await ApiClient.user.deleteUser(user.id) // is this throwing?

			if (!response.success) {
				throw new Error(response.error || t('something_went_wrong'))
			}

			setSuccess(true)
			setTimeout(() => {
				navigate('../pages/Login')
			}, 2000)

		} catch (err: any) {
			setError(err.message || t('something_went_wrong'))
		}
	}

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="profile-box flex-row basis-4/5">
                <div className="flex basis-2/6 items-center justify-center gap-10 p-4">
                    <div className="bubble bg-white/50 w-72 h-72 flex items-end justify-center overflow-hidden">
						<img
                            src={avatars[avatarIdx]}
                            alt="Avatar preview"
                            className={`object-contain ${avatarSizes[avatarIdx]}`}
						/>
					</div>
					
                    <div className="flex flex-col items-center">
                        <h1 className="pt-6 text-6xl text-[#fff] font-fascinate">{user?.username}</h1>
                        
                        <p className="pt-4">Select an avatar</p>
                            <div className="flex justify-center gap-4 pt-1">
                                <button onClick={prevAvatar}>⟨</button>
                                <button onClick={selectAvatar}>Select</button>
                                <button onClick={nextAvatar}>⟩</button>
                            </div>
                    </div>
					
                </div>

                <div className="flex basis-3/6 h-full flex-col items-center justify-center gap-10 p-4 bg-[#605c4c13] px-6">
                    <div className="w-full max-w-sm">
                        <label className="profile-label">{t('username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="profile-input-field"
                        />
                    </div>

                    <div className="w-full max-w-sm">
                        <label className="profile-label">{t('display_name')}</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="profile-input-field"
                        />
                    </div>

                    <div className="w-full max-w-sm">
                        <label className="profile-label">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                            }}
                            placeholder={t('password')}
                            className="profile-input-field"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                            }}
                            placeholder={t('confirm_password')}
                            className={`w-full bg-transparent border-b-2 mt-3 border-white focus:outline-none focus:border-white/70 ${
                                password === confirmPassword ? 'text-white' : 'text-white/40'
                            } text-lg placeholder-white/60`}
                        />
                    </div>

                    <div className="w-full max-w-sm">
                        <label className="profile-label">{t('language')}</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-white focus:outline-none focus:border-white/70 text-white text-lg"
                        >
                            <option value="en" className="bg-[#2c2c2c] text-white">English</option>
                            <option value="fi" className="bg-[#2c2c2c] text-white">Finnish</option>
                            <option value="est" className="bg-[#2c2c2c] text-white">Estonian</option>
                        </select>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="profile-button"
                    >
                        {t('confirm')}
                    </button>
                </div>
                
                <div className="flex flex-col h-full basis-1/6 justify-center items-center p-4">
                	<button 
						onClick={handleDelete}
						className="profile-button"
					>
						{t('delete_account')}
					</button>
					{success && (
						<p className="text-white mt-4 text-center">
							Account deleted successfully
						</p>
					)}
					{error && (
						<p className="text-white mt-4 text-center">
							{error}
						</p>
					)}
                </div>
            </div>
        </div>
    )
}

export default Profile
