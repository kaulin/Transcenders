import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

import playfulCat from "/images/playfulKitten.avif"

const Login = () => {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
	
		try {
			setUser({
				id: 1,
				username: username
			})

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
					type="text" value={username}
					placeholder={t("username")}
					className="login-input-field mt-2"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<input
					type="password" value={password}
					placeholder={t("password")}
					className="login-input-field mt-2"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className="mt-2 button-text" onClick={handleLogin}>
				{t('log_in')}
				</button>

				<p className="mt-6">{t('new_user')}?
					<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')} </Link>
				</p>
			</form>

			<img
				src={playfulCat}
				alt="playful"
				className="login-cat-position"
			/>
		</div>
    )
}

export default Login
