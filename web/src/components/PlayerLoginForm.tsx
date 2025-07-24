import { useState } from "react"
import { useTranslation } from "react-i18next"

import useVerifyLogin from "../hooks/useVerifyLogin.ts"
import { usePlayers } from "../contexts/PlayersContext.tsx"
import { ApiClient } from "@transcenders/api-client"
import type { Player } from "../types/types.ts"

type Props = {
  playerNumber: number;
  player?: Player;
}

const PlayerLoginForm = ({ playerNumber, player }: Props) => {
	const { players, setPlayer, resetPlayer } = usePlayers()
	const { login } = useVerifyLogin()
	const { t } = useTranslation()

	const [username, setUsername] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	const handleGoBack = () => {
		resetPlayer(playerNumber)
		setUsername("")
		setPassword("")
		setError(null)
	}

	const handleUsernameCheck = () => {
		const taken = Object.values(players).some(p => p.username === username)
		if (taken) {
			setError(t('username_taken'))
			return false
		}
		return true
	}

	const handleGuestContinue = async () => {
		if (!username?.trim()) {
			setError(t('input_username'))
			return
		}

		if (!handleUsernameCheck())
			return
		
		try {
			const response = await ApiClient.user.getUserExact({ username: username })
			
			if (response?.success) {
				setError(t('username_taken'))
				return
			}
		} catch {}

		setPlayer(playerNumber, {
			id: 0,
			username: username,
			ready: true
		})
	}

	const handleLoginContinue = async () => {
		if (!username?.trim() || !password) {
			setError(t('input_username_pw'))
			return
		}

		if (!handleUsernameCheck())
			return

		try {
			await login(username?.trim(), password, playerNumber)
		} catch (err: any) {
			setError(t(err.message) || t('something_went_wrong'))
		}
	}

	const backAndContinueButtons = (onContinue: () => void) => (
		<div className="flex justify-between text-sm sm:text-base">
			<button className="mt-2 p-2" onClick={handleGoBack}>
				← {t('go_back')}
			</button>

			<button className="mt-2 p-2" onClick={onContinue}>
				{t('continue')} →
			</button>
		</div>
	)

	if (!player?.mode) {
		return (
			<>
				<h2 className="fascinate-label mb-3">{t('player')} {playerNumber}</h2>
				<div className="flex flex-col gap-2 items-start text-sm">
					<button className="flex items-center text-lg gap-1" onClick={() => setPlayer(playerNumber, {mode: "guest"})}>
						{t('play_as_guest')}
					</button>

					<button className="flex items-center text-lg gap-1" onClick={() => setPlayer(playerNumber, {mode: "login"})}>
						{t('log_in')}
					</button>
				</div>
			</>
		)
	}

	if (player?.ready) {
		return (
			<>
				<h2 className="fascinate-label">{t('player')} {playerNumber}</h2>
				<p className="border-b-2 border-white text-lg">{player.username}</p>
				<div className="flex justify-between">
					<button className="mt-2 p-2" onClick={handleGoBack}>
						← {t('go_back')}
					</button>

					<p className="text-lg pt-4">✓</p>
				</div>
			</>
		)
	}

	return (
		<>
			<h2 className="fascinate-label">{t('player')} {playerNumber}</h2>
			<input
				type="text"
				placeholder={t('username')}
				className="input-field"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>

			{player?.mode === "login" &&
				<input
					type="password"
					placeholder={t('password')}
					className="input-field"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>		
			}

			{player.mode === "login"
				? backAndContinueButtons(handleLoginContinue)
				: backAndContinueButtons(handleGuestContinue)
			}

			{error && (
				<div className="text-[#786647] text-xs sm:text-sm">
					{error}
				</div>
			)}
		</>
	)
}

export default PlayerLoginForm
