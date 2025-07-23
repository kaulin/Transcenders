import { useTranslation } from "react-i18next"
import { Link } from 'react-router-dom'
import { useState } from "react"
import useAuthLogin from "../hooks/useAuthLogin.ts"

// import playfulCat from "/images/playfulCat.avif"

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
			setError(t('incorrect_username_pw'))
		}
	}

	return (
		<div className="relative w-full h-full flex justify-center items-center pb-28">
		{/* <div className="profile-box justify-center items-center pb-28 bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat"> */}
			<form
				onSubmit={handleLogin}
				className="login-bubble bg-[#ffe6d5]/20">
				
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

				{error && <p className="text-[#513838] mt-2 text-sm">{error}</p>}

				<button type="submit" className="mt-4 button-text">
					{t('log_in')}
				</button>

				<p className="mt-6">{t('new_user')}?
					<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')} </Link>
				</p>
			</form>
		{/* </div> */}
		</div>
    )
    // return (
	// 	<div className="relative w-full h-full">
	// 	<div className="profile-box justify-center items-center pb-28 bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat">
	// 		<form
	// 			onSubmit={handleLogin}
	// 			className="login-bubble bg-[#6e5d41]/10 backdrop-blur-sm">
				
	// 			<h1 className="text-3xl font-fascinate py-3">{t('log_in')}</h1>

	// 			<input
	// 				type="text"
	// 				required
	// 				value={username}
	// 				placeholder={t("username")}
	// 				className="login-input-field mt-2"
	// 				onChange={(e) => setUsername(e.target.value)}
	// 				/>

	// 			<input
	// 				type="password"
	// 				required
	// 				value={password}
	// 				placeholder={t("password")}
	// 				className="login-input-field mt-2"
	// 				onChange={(e) => setPassword(e.target.value)}
	// 				/>

	// 			{error && <p className="text-[#513838] mt-2 text-sm">{error}</p>}

	// 			<button type="submit" className="mt-4 button-text">
	// 				{t('log_in')}
	// 			</button>

	// 			<p className="mt-6">{t('new_user')}?
	// 				<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')} </Link>
	// 			</p>
	// 		</form>

	// 		{/* <img
	// 			src={playfulCat}
	// 			alt="playful"
	// 			className="login-cat-position"
	// 		/> */}
	// 	</div>
	// 	</div>
    // )
}

export default Login