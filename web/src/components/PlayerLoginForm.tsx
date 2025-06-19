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
			const verifiedUser = await login(username?.trim(), password)

			setPlayer(playerNumber, {
				id: verifiedUser?.id,
				username: verifiedUser?.username,
				avatar: verifiedUser?.avatar,
				ready: true
			})

		} catch (err: any) {
			setError(t('incorrect_username_pw'))
		}
	}

	const backAndContinueButtons = (onContinue: () => void) => (
		<div className="flex justify-between">
			<button className="mt-2 p-2" onClick={handleGoBack}>
				← {t('go_back')}
			</button>

			<button className="mt-2 p-2" onClick={onContinue}>
				{t('continue')} ➜
			</button>
		</div>
	)

	if (!player?.mode) {
		return (
			<>
				<h2 className="profile-label">{t('player')} {playerNumber}</h2>
				<div className="flex gap-2 items-start text-sm">
					<button className="profile-button mt-0" onClick={() => setPlayer(playerNumber, {mode: "guest"})}>
						{t('play_as_guest')}
					</button>

					<button className="profile-button mt-0" onClick={() => setPlayer(playerNumber, {mode: "login"})}>
						{t('log_in')}
					</button>
				</div>
			</>
		)
	}

	if (player?.ready) {
		return (
			<>
				<h2 className="profile-label">{t('player')} {playerNumber}</h2>
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
			<h2 className="profile-label">{t('player')} {playerNumber}</h2>
			<input
				type="text"
				placeholder={t('username')}
				className="profile-input-field"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>

			{player?.mode === "login" &&
				<input
					type="password"
					placeholder={t('password')}
					className="profile-input-field"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>		
			}

			{player.mode === "login"
				? backAndContinueButtons(handleLoginContinue)
				: backAndContinueButtons(handleGuestContinue)
			}

			{error && (
				<div className="text-[#513838]">
					{error}
				</div>
			)}
		</>
	)
}

export default PlayerLoginForm
