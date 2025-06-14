import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"
import { ApiClient } from "@transcenders/api-client"

function SignUp() {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleSignUp = () => {
        setUser({
            id: 1,
            name: username
        })
    }

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
				className="login-bubble">

				<h1 className="text-3xl font-fascinate mb-3">{t('sign_up')}</h1>

				<input
					type="text" value={username}
					placeholder={t('username')}
					className="login-input-field mt-2"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<input
					type="password"
					placeholder={t('password')}
					className="login-input-field mt-2"
				/>

				<input
					type="password" value={password}
					placeholder={t('confirm_password')}
					className="login-input-field mt-2"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className="mt-2 button-text" onClick={handleSignUp}>{t('sign_up')}</button>

				<p className="mt-6">{t('existing_user')}?</p>
				<p>
					<Link to="/" className="button-text underline underline-offset-2"> {t('log_in')} </Link>
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

export default SignUp
