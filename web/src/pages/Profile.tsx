import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { ApiClient } from "@transcenders/api-client"
import { type DefaultAvatarsResult, type User } from "@transcenders/contracts"

// import avatarCat1 from "/images/avatarCat1.avif"
// import avatarCat2 from "/images/avatarCat2.avif"
// import avatarCat3 from "/images/avatarCat3.avif"
// import avatarCat4 from "/images/avatarCat4.avif"
// import avatarCat5 from "/images/avatarCat5.avif"
// import avatarCat6 from "/images/avatarCat6.avif"
interface DefaultAvatar {
    name: string;
    url: string;
}

// const avatars = [avatarCat1, avatarCat2, avatarCat3, avatarCat4, avatarCat5, avatarCat6]

const Profile = () => {
    const { t } = useTranslation()
    const { setUser, user } = useUser()

    // Avatar state
    const [availableAvatars, setAvailableAvatars] = useState<DefaultAvatar[]>([])
    const [currentAvatarIndex, setCurrentAvatarIndex] = useState<number>(0)
    const [selectedAvatarName, setSelectedAvatarName] = useState<string>('')
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>('')
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [avatarMode, setAvatarMode] = useState<'default' | 'upload'>('default')

    // Form state
    const [username, setUsername] = useState(user?.username || "")
    const [displayName, setDisplayName] = useState(user?.display_name || "")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [language, setLanguage] = useState(user?.lang || "")
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Load available default avatars on component mount
    useEffect(() => {
        const loadDefaultAvatars = async () => {
            try {
                const response = await ApiClient.user.getDefaultAvatars()
                if (response.success) {
                    const avatars = (response.data as DefaultAvatarsResult).avatars
                    setAvailableAvatars(avatars)
                    
                    // Set current avatar if user has one
                    if (user?.avatar) {
                        const currentAvatarName = user.avatar.split('/').pop() || ''
                        const currentIndex = avatars.findIndex(avatar => avatar.name === currentAvatarName)
                        if (currentIndex >= 0) {
                            setCurrentAvatarIndex(currentIndex)
                            setSelectedAvatarName(avatars[currentIndex].name)
                        }
                        setAvatarPreviewUrl(ApiClient.user.getAvatarUrl(user.avatar))
                    } else if (avatars.length > 0) {
                        // Default to first avatar if user has no avatar
                        setSelectedAvatarName(avatars[0].name)
                        setAvatarPreviewUrl(ApiClient.user.getAvatarUrl(avatars[0].url))
                    }
                }
            } catch (error) {
                console.error('Failed to load default avatars:', error)
            }
        }
        
        loadDefaultAvatars()
    }, [user])

    const nextAvatar = () => {
        if (availableAvatars.length === 0) return
        const nextIndex = (currentAvatarIndex + 1) % availableAvatars.length
        setCurrentAvatarIndex(nextIndex)
        setSelectedAvatarName(availableAvatars[nextIndex].name)
        setAvatarPreviewUrl(ApiClient.user.getAvatarUrl(availableAvatars[nextIndex].url))
    }

    const prevAvatar = () => {
        if (availableAvatars.length === 0) return
        const prevIndex = (currentAvatarIndex - 1 + availableAvatars.length) % availableAvatars.length
        setCurrentAvatarIndex(prevIndex)
        setSelectedAvatarName(availableAvatars[prevIndex].name)
        setAvatarPreviewUrl(ApiClient.user.getAvatarUrl(availableAvatars[prevIndex].url))
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setAvatarMode('upload')
            
            // Create preview URL for uploaded file
            const previewUrl = URL.createObjectURL(file)
            setAvatarPreviewUrl(previewUrl)
        }
    }

    const setDefaultAvatarMode = () => {
        setAvatarMode('default')
        if (availableAvatars.length > 0) {
            setAvatarPreviewUrl(ApiClient.user.getAvatarUrl(availableAvatars[currentAvatarIndex].url))
        }
        setUploadedFile(null)
    }

    const handleAvatarUpdate = async () => {
        if (!user?.id) return

        setIsLoading(true)
        setError(null)

        try {
            if (avatarMode === 'upload' && uploadedFile) {
                // Upload custom avatar
                const response = await ApiClient.user.uploadAvatar(user.id, uploadedFile)
                if (!response.success) {
                    throw new Error(response.error || 'Failed to upload avatar')
                }
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            } else if (avatarMode === 'default' && selectedAvatarName) {
                // Set default avatar
                const response = await ApiClient.user.setDefaultAvatar(user.id, selectedAvatarName)
                if (!response.success) {
                    throw new Error(response.error || 'Failed to set default avatar')
                }
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }

            // refresh user data to get updated avatar
            const userResponse = await ApiClient.user.getUserById(user.id)
            if (userResponse.success) {
                setUser(userResponse.data as User)
            }

        } catch (err: any) {
            setError(err.message || 'Failed to update avatar')
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileUpdate = async () => {
        setError(null)
        
        if (password && password !== confirmPassword) {
            setError(t('pw_no_match'))
            return
        }

        if (!user?.id) return

        setIsLoading(true)

        try {
            // Update user profile
            const updateData: any = {}
            if (username !== user.username) updateData.username = username
            if (displayName !== user.display_name) updateData.display_name = displayName
            if (language !== user.lang) updateData.lang = language

            if (Object.keys(updateData).length > 0) {
                const response = await ApiClient.user.updateUser(user.id, updateData)
                if (!response.success) {
                    throw new Error(response.error || 'Failed to update profile')
                }
            }

            // Update password if provided
            if (password) {
                const passwordResponse = await ApiClient.auth.changePassword(user.id, '', password)
                if (!passwordResponse.success) {
                    throw new Error(passwordResponse.error || 'Failed to update password')
                }
                setPassword('')
                setConfirmPassword('')
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)

            // Refresh user data
            const userResponse = await ApiClient.user.getUserById(user.id)
            if (userResponse.success) {
                setUser(userResponse.data as User)
            }

        } catch (err: any) {
            setError(err.message || t('something_went_wrong'))
        } finally {
            setIsLoading(false)
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

    const navigate = useNavigate()

	// const [avatarIdx, setAvatarIdx] = useState<number>(0)
	// const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
	
	// const navigate = useNavigate()

	// const nextAvatar = () => {
	// 	setAvatarIdx((prev) => (prev + 1) % avatars.length)
	// }

	// const prevAvatar = () => {
	// 	setAvatarIdx((prev) => (prev - 1 + avatars.length) % avatars.length)
	// }

	// const selectAvatar = () => {
	// 	setSelectedAvatar(avatars[avatarIdx])
	// }

	// useEffect(() => {
	// 	const imgs = avatars.map((src) => {
	// 		const img = new Image()
	// 		img.src = src
	// 		return img
	// 	})
	// }, [])

	// const avatarSizes = [
	// 	"max-w-[65%]",
	// 	"max-w-[85%]",
	// 	"max-w-[98%]",
	// 	"max-w-[80%]",
	// 	"max-w-[80%]",
	// 	"max-w-[70%]",
	// ]

    // const [username, setUsername] = useState(user?.username || "")
    // const [displayName, setDisplayName] = useState(user?.display_name || "")
    // const [password, setPassword] = useState("")
    // const [confirmPassword, setConfirmPassword] = useState("")
    // const [language, setLanguage] = useState(user?.lang || "")
	// const [success, setSuccess] = useState<boolean>(false)
    // const [error, setError] = useState<string | null>(null)

    // const handleConfirm = async () => {
    //     setError(null)
        
    //     if (password !== confirmPassword) {
	// 		setError(t('pw_no_match'))
	// 		return
	// 	}

    //     try {

    //     } catch (err) {

    //     }
    // }

	// const handleDelete = async () => {
	// 	setError(null)

	// 	try {
	// 		if (user?.id == null) {
	// 			throw new Error("User ID is undefined")
	// 		}

	// 		const response = await ApiClient.user.deleteUser(user.id)

	// 		if (!response.success) {
	// 			throw new Error(response.error || t('something_went_wrong'))
	// 		}

	// 		setSuccess(true)
            
	// 		setTimeout(() => {
    //             setUser(null)
	// 			navigate('/login')
	// 		}, 2000)

	// 	} catch (err: any) {
	// 		setError(err.message || t('something_went_wrong'))
	// 	}
	// }

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="profile-box flex-row basis-4/5">
                <div className="flex basis-2/6 items-center justify-center gap-10 p-4">
                    <div className="bubble bg-white/50 w-72 h-72 flex items-center justify-center overflow-hidden">
                        {avatarPreviewUrl ? (
                            <img
                                src={avatarPreviewUrl}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-white/60">No avatar</div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <h1 className="pt-6 text-6xl text-[#fff] font-fascinate">{user?.username}</h1>
                        
                        <div className="pt-4">
                            <p className="text-center mb-2">Avatar Options</p>
                            
                            {/* Avatar mode selector */}
                            <div className="flex justify-center gap-2 mb-4">
                                <button 
                                    onClick={setDefaultAvatarMode}
                                    className={`px-3 py-1 rounded text-sm ${avatarMode === 'default' ? 'bg-white text-black' : 'bg-black/20 text-white'}`}
                                >
                                    Default
                                </button>
                                <button 
                                    onClick={() => setAvatarMode('upload')}
                                    className={`px-3 py-1 rounded text-sm ${avatarMode === 'upload' ? 'bg-white text-black' : 'bg-black/20 text-white'}`}
                                >
                                    Upload
                                </button>
                            </div>

                            {avatarMode === 'default' && (
                                <div>
                                    <p className="text-center mb-2">Select default avatar</p>
                                    <div className="flex justify-center gap-4 mb-4">
                                        <button onClick={prevAvatar} className="text-2xl">⟨</button>
                                        <span className="text-sm self-center">
                                            {availableAvatars.length > 0 ? `${currentAvatarIndex + 1}/${availableAvatars.length}` : '0/0'}
                                        </span>
                                        <button onClick={nextAvatar} className="text-2xl">⟩</button>
                                    </div>
                                </div>
                            )}

                            {avatarMode === 'upload' && (
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-white file:text-black"
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleAvatarUpdate}
                                disabled={isLoading || (!uploadedFile && avatarMode === 'upload')}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                {isLoading ? 'Updating...' : 'Update Avatar'}
                            </button>
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
                            <option value="et" className="bg-[#2c2c2c] text-white">Estonian</option>
                        </select>
                    </div>

                    <button
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                        className="profile-button"
                    >
                        {isLoading ? 'Updating...' : t('confirm')}
                    </button>
                </div>
                
                <div className="flex flex-col basis-1/6 justify-center items-center p-4">
                    <button 
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="profile-button"
                    >
                        {t('delete_account')}
                    </button>
                    {success && (
                        <p className="text-green-400 mt-4 text-center">
                            {t('updated_successfully') || 'Updated successfully!'}
                        </p>
                    )}
                    {error && (
                        <p className="text-red-400 mt-4 text-center">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
//         <div className="w-full h-full flex flex-col justify-center">
//             <div className="profile-box flex-row basis-4/5">
//                 <div className="flex basis-2/6 items-center justify-center gap-10 p-4">
//                     <div className="bubble bg-white/50 w-72 h-72 flex items-end justify-center overflow-hidden">
// 						<img
//                             src={avatars[avatarIdx]}
//                             alt="Avatar preview"
//                             className={`object-contain ${avatarSizes[avatarIdx]}`}
// 						/>
// 					</div>
					
//                     <div className="flex flex-col items-center">
//                         <h1 className="pt-6 text-6xl text-[#fff] font-fascinate">{user?.username}</h1>
                        
//                         <p className="pt-4">Select an avatar</p>
//                             <div className="flex justify-center gap-4 pt-1">
//                                 <button onClick={prevAvatar}>⟨</button>
//                                 <button onClick={selectAvatar}>Select</button>
//                                 <button onClick={nextAvatar}>⟩</button>
//                             </div>
//                     </div>
					
//                 </div>

//                 <div className="flex basis-3/6 h-full flex-col items-center justify-center gap-10 p-4 bg-[#605c4c13] px-6">
//                     <div className="w-full max-w-sm">
//                         <label className="profile-label">{t('username')}</label>
//                         <input
//                             type="text"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="profile-input-field"
//                         />
//                     </div>

//                     <div className="w-full max-w-sm">
//                         <label className="profile-label">{t('display_name')}</label>
//                         <input
//                             type="text"
//                             value={displayName}
//                             onChange={(e) => setDisplayName(e.target.value)}
//                             className="profile-input-field"
//                         />
//                     </div>

//                     <div className="w-full max-w-sm">
//                         <label className="profile-label">{t('password')}</label>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={(e) => {
//                                 setPassword(e.target.value)
//                             }}
//                             placeholder={t('password')}
//                             className="profile-input-field"
//                         />
//                         <input
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(e) => {
//                                 setConfirmPassword(e.target.value)
//                             }}
//                             placeholder={t('confirm_password')}
//                             className={`w-full bg-transparent border-b-2 mt-3 border-white focus:outline-none focus:border-white/70 ${
//                                 password === confirmPassword ? 'text-white' : 'text-white/40'
//                             } text-lg placeholder-white/60`}
//                         />
//                     </div>

//                     <div className="w-full max-w-sm">
//                         <label className="profile-label">{t('language')}</label>
//                         <select
//                             value={language}
//                             onChange={(e) => setLanguage(e.target.value)}
//                             className="w-full bg-transparent border-b-2 border-white focus:outline-none focus:border-white/70 text-white text-lg"
//                         >
//                             <option value="en" className="bg-[#2c2c2c] text-white">English</option>
//                             <option value="fi" className="bg-[#2c2c2c] text-white">Finnish</option>
//                             <option value="et" className="bg-[#2c2c2c] text-white">Estonian</option>
//                         </select>
//                     </div>

//                     <button
//                         onClick={handleConfirm}
//                         className="profile-button"
//                     >
//                         {t('confirm')}
//                     </button>
//                 </div>
                
//                 <div className="flex flex-col basis-1/6 justify-center items-center p-4">
//                 	<button 
// 						onClick={handleDelete}
// 						className="profile-button"
// 					>
// 						{t('delete_account')}
// 					</button>
// 					{success && (
// 						<p className="text-white mt-4 text-center">
// 							Account deleted successfully
// 						</p>
// 					)}
// 					{error && (
// 						<p className="text-[#513838] mt-4 text-center">
// 							{error}
// 						</p>
// 					)}
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Profile
