import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

import playfulCat from "/images/playfulCat.avif"

function Login() {
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
		<div className="flex h-full justify-center items-center pb-28">
			<div className="bubble shadow-[0_0_3px_3px_#fff] w-[min(90vw,90vh)] max-w-[500px] z-10 p-16 flex flex-col justify-center items-center">
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

				<button className="mt-2 button-text" onClick={handleLogin}>{t('log_in')} </button>

				<p className="pt-6">
					{t('new_user')}?
					<Link to="/SignUp" className="button-text underline underline-offset-2"> {t('sign_up')} </Link>
				</p>
			</div>

			<img
				src={playfulCat}
				alt="playful"
				className="absolute bottom-0 left-1/2 -translate-x-[70%]
				w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
    )
}

export default Login
