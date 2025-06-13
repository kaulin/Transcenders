import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

function Login() {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

	// async function handleLogin(e: React.FormEvent) {
	// 	e.preventDefault()
	// 	setError(null)

	// 	try {
	// 		const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${USER_ROUTES.USERS}`, {
	// 			method: '',
	// 			headers: {'Content-Type': 'application/json'},
	// 			body: JSON.stringify({
	// 				username,
	// 				password
	// 			})
	// 		})

	// 		if (!res.ok) {
	// 			const message = await res.text()
	// 			throw new Error(message)
	// 		}

	// 		const data = await res.json()
		
	// 		setUser({
	// 			id: data.id,
	// 			name: data.username
	// 		})
		
	// 	} catch (err:any) {
	// 		setError(err.message || t('something_went_wrong'))
	// 	}
    // }

	async function handleLogin(e: React.FormEvent) {

		setUser({
			id: 1,
			username: username
		})
	}

    return (
		<div className="flex h-full justify-center items-center pb-28">
			<div className="bubble w-[min(90vw,90vh)] max-w-[500px] z-10 p-16 flex flex-col justify-center items-center">
				<h1 className="text-2xl py-3">{t('online_log_in')}</h1>

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

				<p className="pt-6">
				{t('new_user')}?
				<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')}</Link>
				</p>
			</div>
		</div>
    )
}

export default Login
