import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

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

    return (
		<div className="flex h-full justify-center items-center pb-28">
			<div className="bubble w-[min(90vw,90vh)] max-w-[500px] z-10 p-16 flex flex-col justify-center items-center">
				<h1 className="text-2xl mb-3">{t('create_account')}</h1>

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
				<p><Link to="/" className="button-text underline underline-offset-2"> {t('log_in')}</Link></p>
			</div>
		</div>
    )
}

export default SignUp
