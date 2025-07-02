import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"
import { ApiClient } from "@transcenders/api-client"
import {
  type AuthData,
  type JWTPayload,
  type LoginUser,
  type RegisterUser,
  type User,
} from '@transcenders/contracts'

// import playfulCat from "/images/playfulCat.avif"

const SignUp = () => {
	const { t } = useTranslation()
	const { setUser } = useUser()

	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function handleSignUp(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		if (password !== confirmPassword) {
			setError(t('pw_no_match'))
			return
		}

		try {
			const registrationInfo: RegisterUser = {
					username: username,
					email: email,
					password: password,
				}
				// this returns just true or false for now, could change to returning a full user object I guess
				const response = await ApiClient.auth.register(registrationInfo)

				if (!response.success) {
					throw new Error(response.error || t('something_went_wrong'))
				}

				const loginInfo: LoginUser = {
					username: username,
					password: password,
				}

				const userLogin = await ApiClient.auth.login(loginInfo)
				if (!userLogin.success) {
					throw new Error(userLogin.error || t('something_went_wrong'))
				}
				
				const authData = userLogin.data as AuthData
				const newUserId = JSON.parse(atob(authData.accessToken.split('.')[1])) as JWTPayload
				const userReq = await ApiClient.user.getUserById(newUserId.userId)

				if (!userReq.success) {
					throw new Error(userReq.error || t('something_went_wrong'))
				}

				const user = userReq.data as User
				setUser(user)

			} catch (err: any) {
				setError(err.message || t('something_went_wrong'))
			}
	}

	return (
		<div className="relative w-full h-full">
			<div className="profile-box justify-center items-center pb-28 bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat]">
				<form
					onSubmit={handleSignUp}
					className="login-bubble bg-[#6e5d41]/10">

					<h1 className="text-3xl font-fascinate mb-3">{t('sign_up')}</h1>

					<input
						type="text"
						required
						value={username}
						placeholder={t('username')}
						className="login-input-field mt-2"
						onChange={(e) => setUsername(e.target.value)}
					/>

					<input
						type="email"
						required
						value={email}
						placeholder={t('email')}
						className="login-input-field mt-2"
						onChange={(e) => setEmail(e.target.value)}
					/>

					<input
						type="password"
						required
						value={password}
						placeholder={t('password')}
						className="login-input-field mt-2"
						onChange={(e) => setPassword(e.target.value)}
					/>

					<input
						type="password"
						required
						value={confirmPassword}
						placeholder={t('confirm_pw')}
						className="login-input-field mt-2"
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>

					{error && <p className="text-[#901c1c] mt-2 text-sm">{error}</p>}

					<button type="submit" className="mt-4 button-text">
						{t('sign_up')}
					</button>

					<p className="mt-6">{t('existing_user')}?</p>
					<p>
						<Link to="/" className="button-text underline underline-offset-2"> {t('log_in')} </Link>
					</p>
				</form>

				{/* <img
					src={playfulCat}
					alt="playful cat"
					className="login-cat-position"
				/> */}
			</div>
		</div>
	)
}

export default SignUp