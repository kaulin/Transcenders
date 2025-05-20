import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

function SignIn() {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleLogin = () => {
        setUser({
            id: 1,
            name: username
        })
    }

    return (
		<div className="bubble w-[90vw] max-w-md flex flex-col justify-center items-center p-14">
			<h1 className="text-2xl mb-3">{t('online_log_in')}</h1>

			<input
				type="text" value={username}
				placeholder={t("username")}
				className="login-input-field"
				onChange={(e) => setUsername(e.target.value)}
			/>

			<input
				type="password" value={password}
				placeholder={t("password")}
				className="login-input-field"
				onChange={(e) => setPassword(e.target.value)}
			/>

			<button className="mt-2 button-text" onClick={handleLogin}>{t('log_in')}</button>

			<p className="mt-6">
				{t('new_user')}?
				<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')}</Link>
			</p>
		</div>
    )
}

export default SignIn
