import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { ApiClient } from "@transcenders/api-client"
import {
	Upload,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'

import avatarCat1 from "/images/avatarCat1.avif"
import avatarCat2 from "/images/avatarCat2.avif"
import avatarCat3 from "/images/avatarCat3.avif"
import avatarCat4 from "/images/avatarCat4.avif"
import avatarCat5 from "/images/avatarCat5.avif"
import avatarCat6 from "/images/avatarCat6.avif"

const avatars = [avatarCat1, avatarCat2, avatarCat3, avatarCat4, avatarCat5, avatarCat6]

const Profile = () => {
    const { t } = useTranslation()
    const { setUser, user } = useUser()

	const [avatarIdx, setAvatarIdx] = useState<number>(0)
	
	const navigate = useNavigate()

	const nextAvatar = () => {
		setAvatarIdx((prev) => (prev + 1) % avatars.length)
	}

	const prevAvatar = () => {
		setAvatarIdx((prev) => (prev - 1 + avatars.length) % avatars.length)
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

			const response = await ApiClient.user.deleteUser(user.id)

			if (!response.success) {
				throw new Error(response.error || t('something_went_wrong'))
			}

			setSuccess(true)
            
			setTimeout(() => {
                setUser(null)
				navigate('/login')
			}, 2000)

		} catch (err: any) {
			setError(err.message || t('something_went_wrong'))
		}
	}

    return (
        <div className="profile-box">
            <div className="flex xl:flex-1 w-full min-h-full flex-col flex-shrink-0 xl:flex-shrink items-center justify-center gap-10 px-8 py-16 bg-[#6e5d41]/15 xl:bg-transparent">
                <div className="bubble bg-white/50 w-72 h-72 flex items-end justify-center overflow-hidden">
                    <img
                        src={avatars[avatarIdx]}
                        alt="Avatar preview"
                        className={`object-contain ${avatarSizes[avatarIdx]}`}
                    />
                </div>
                
                <div className="flex flex-col items-center">
                    <h1 className="pt-6 text-6xl text-[#fff] font-fascinate">{user?.username}</h1>
                    
                        <div className="flex min-w-[200px] justify-center gap-2 mt-2 items-center p-2 rounded-full  border-white hover:border-[#786647] bg-white/10 text-white">
							<button className="" onClick={prevAvatar}><ChevronLeft /></button>
							<p>{t('select_avatar')}</p>
                            <button className="" onClick={nextAvatar}><ChevronRight /></button>
                        </div>
						<div className="flex min-w-[200px] justify-center gap-2 mt-2 items-center p-2 rounded-full  border-white hover:border-[#786647] bg-white/10 text-white">
							<p className="pt-1">{t('upload_avatar')}</p>
							<button><Upload className="h-5 w-5"/></button>
						</div>
                </div>
                
            </div>

            <div className="w-full min-h-full flex xl:flex-1 flex-col items-center justify-center gap-10 flex-shrink-0 xl:flex-shrink bg-[#6e5d41]/15 px-8 py-16 backdrop-blur-sm">
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
                        placeholder={t('new_pw')}
                        className="profile-input-field"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value)
                        }}
                        placeholder={t('confirm_new_pw')}
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
                        <option value="en" className="bg-white text-[#786647]">{t('english')}</option>
                        <option value="fi" className="bg-white text-[#786647]">{t('finnish')}</option>
                        <option value="et" className="bg-white text-[#786647]">{t('estonian')}</option>
                    </select>
                </div>

                <button
                    onClick={handleConfirm}
                    className="rounded-button font-fascinate uppercase mt-8"
                >
                    {t('confirm')}
                </button>
            </div>
            
            <div className="flex xl:flex-1 w-full min-h-full flex-col flex-shrink-0 xl:flex-shrink justify-center items-center px-8 py-16 bg-[#6e5d41]/15 xl:bg-transparent">
                <button 
                    onClick={handleDelete}
                    className="rounded-button font-fascinate uppercase"
                >
                    {t('delete_account')}
                </button>
                {success && (
                    <p className="text-white mt-4 text-center">
                        Account deleted successfully
                    </p>
                )}
                {error && (
                    <p className="text-[#513838] mt-4 text-center">
                        {error}
                    </p>
                )}
            </div>
    </div>
    )
}

export default Profile