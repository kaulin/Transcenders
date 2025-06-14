import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"
// import { USER_ROUTES } from "@transcenders/contracts"
import { ApiClient } from "@transcenders/api-client"

import playfulCat from "/images/playfulCat.avif"

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
			const response = await ApiClient.user.createUser({
				username: username,
				email: email,
				display_name: username,
				lang: 'en',
			})
			
			if (!response.success) {
				throw new Error(response.error || t('something_went_wrong'))
			}
			
			// probably won't be needing this later
			const user = response.data as { id: number; username: string; email: string; display_name: string; avatar: string | null; lang: string;  };
			
			setUser({
				id: user.id,
				username: user.username,
				email: user.email,
				display_name: user.username,
				avatar: user.avatar,
				lang: user.lang,
			})
			
			} catch (err: any) {
				setError(err.message || t('something_went_wrong'))
			}
	}

	return (
		<div className="flex h-full justify-center items-center pb-28">
			<form
				onSubmit={handleSignUp}
				className="bubble shadow-[0_0_3px_3px_#fff] w-[min(90vw,90vh)] max-w-[500px] z-10 p-16 flex flex-col justify-center items-center">

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
					placeholder={t('confirm_password')}
					className="login-input-field mt-2"
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>

				{error && <p className="text-[#901c1c] mt-2 text-sm">{error}</p>}

				<button type="submit" className="mt-4 button-text">
					{t('sign_up')}
				</button>

				<p className="mt-6">{t('existing_user')}?</p>
				<p>
					<Link to="/" className="button-text underline underline-offset-2">
						{t('log_in')}
					</Link>
				</p>
			</form>

			<img
				src={playfulCat}
				alt="playful"
				className="absolute bottom-0 left-1/2 -translate-x-[70%] w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
	);
};

export default SignUp
