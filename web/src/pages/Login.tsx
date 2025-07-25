import { useTranslation } from "react-i18next"
import { Link } from 'react-router-dom'
import { useState } from "react"
import useAuthLogin from "../hooks/useAuthLogin.ts"

const Login = () => {
    const { t } = useTranslation()
	const { login } = useAuthLogin()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		try {
			await login(username, password)
		} catch (err: any) {
			setError(t(err.message) || t('something_went_wrong'))
		}
	}

	return (
		<div className="relative w-full h-full flex justify-center items-center pb-28">
			<form
				onSubmit={handleLogin}
				className="login-bubble">
				
				<h1 className="text-2xl sm:text-3xl font-fascinate py-3">{t('log_in')}</h1>

				<input
					type="text"
					maxLength={20}
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

				<div className="h-4">
					{error && <p className="text-[#786647] mt-2 text-xs sm:text-sm">{error}</p>}
				</div>

				<button type="submit" className="mt-4">
					{t('log_in')}
				</button>

				<p className="mt-6">{t('new_user')}?
					<Link to="/SignUp" className="link-color underline underline-offset-2"> {t('sign_up')} </Link>
				</p>
			</form>
		</div>
    )
}

export default Login
