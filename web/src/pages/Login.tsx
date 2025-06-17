import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"
import { ApiClient } from "@transcenders/api-client"
import {
	type AuthData,
	type JWTPayload,
	type LoginUser,
	type User,
  } from '@transcenders/contracts'

// import playfulCat from "/images/playfulCat.avif"

const Login = () => {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
	
		try {
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
		<div className="flex h-full justify-center items-center pb-28">
			<form
				onSubmit={handleLogin}
				className="login-bubble">
				
				<h1 className="text-3xl font-fascinate py-3">{t('log_in')}</h1>

				<input
					type="text"
					required
					value={username}
					placeholder={t("username")}
					className="login-input-field mt-2"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<input
					type="password"
					required
					value={password}
					placeholder={t("password")}
					className="login-input-field mt-2"
					onChange={(e) => setPassword(e.target.value)}
				/>

				{error && <p className="text-[#901c1c] mt-2 text-sm">{error}</p>}

				<button type="submit" className="mt-4 button-text">
					{t('log_in')}
				</button>

				<p className="mt-6">{t('new_user')}?
					<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')} </Link>
				</p>
			</form>

			{/* <img
				src={playfulCat}
				alt="playful"
				className="login-cat-position"
			/> */}
		</div>
    )
}

export default Login