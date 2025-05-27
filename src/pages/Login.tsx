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
		<div className="relative max-w-md flex justify-center items-center pb-24">
			<div className="bubble w-[90vw] z-10 p-14 flex flex-col justify-center items-center">
				<h1 className="text-2xl py-3 px-6">{t('online_log_in')}</h1>

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

				<button className="pt-2 button-text" onClick={handleLogin}>
				{t('log_in')}
				</button>

				<p className="pt-6">
				{t('new_user')}?
				<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')}</Link>
				</p>
			</div>
			{/* <div className="bubble absolute -bottom-2/4 -right-3/4 w-96 bg-white bg-opacity-10 z-10 flex flex-col justify-center items-center">
				<h1 className="text-2xl mb-3">Start a local match</h1>
				<input
					type="text" value={username}
					placeholder={t("Player 1")}
					className="login-input-field"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<input
					type="text" value={username}
					placeholder={t("Player2")}
					className="login-input-field"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button className="button-text mt-2">Start</button>
			</div> */}
		</div>
    )
}

export default SignIn
