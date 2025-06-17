import { useState } from "react"
import useVerifyLogin from "../hooks/useVerifyLogin.ts"
import type { Player } from "../types/types.ts"

type Props = {
  playerNumber: number;
  player?: Player;
  setPlayer: (playerData: Player) => void;
}

const PlayerLoginForm = ({ playerNumber, player, setPlayer }: Props) => {
	const { login } = useVerifyLogin()

	const [playerMode, setPlayerMode] = useState<Player["mode"] | null>(null)
	const [displayName, setDisplayName] = useState<string>("")
	const [username, setUsername] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	const handleGuestContinue = () => {
		if (!displayName?.trim()) {
			setError("Please input username")
			return
		}

		setPlayer({
			id: undefined,
			username: displayName?.trim(),
			mode: "guest",
			ready: true
		})
	}

	const handleLoginContinue = async () => {
		if (!username?.trim() || !password) {
			setError("Please input username and password")
			return
		}

		try {
			const verifiedUser = await login(username?.trim(), password)
			if (!verifiedUser) {
				return
			}
			
			setPlayer({
				id: verifiedUser.id,
				username: verifiedUser.username,
				avatar: verifiedUser.avatar,
				mode: "login",
				ready: true
			})

		} catch (err: any) {
			setError(err.message)
		}
	}

	const handleGoBack = () => {
		setPlayerMode(null)
		setDisplayName("")
		setUsername("")
		setPassword("")
		
		setPlayer({
			id: undefined,
			username: "",
			mode: null,
			ready: false,
		} as Player)
	}

	if (player?.ready) {
		return (
			<>
				<h2 className="profile-label">Player {playerNumber}</h2>
				<p className="border-b-2 border-white text-lg">{player.username}</p>
				<div className="flex justify-between">
					<button className="mt-2 p-2" onClick={handleGoBack}>
						← Go back
					</button>

					<p className="text-lg pt-4">✓</p>
				</div>
			</>
		)
	}

	return (
		<div className="mb-6">
			<h2 className="profile-label">Player {playerNumber}</h2>
			
			{playerMode === null && (
				<div className="flex gap-2 items-start text-sm">
					<button className="profile-button mt-0" onClick={() => setPlayerMode("guest")}>
						Play as Guest
					</button>

					<button className="profile-button mt-0" onClick={() => setPlayerMode("login")}>
						Log in
					</button>
				</div>
			)}

			{playerMode === "login" && (
				<>
					<input
						type="text"
						placeholder="Username"
						className="profile-input-field"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>

					<input
						type="password"
						placeholder="Password"
						className="profile-input-field"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<div className="flex justify-between">
						<button className="mt-2 p-2" onClick={handleGoBack}>
							← Go back
						</button>

						<button className="mt-2 p-2" onClick={handleLoginContinue}>
							Continue ➜
						</button>
					</div>
				</>
			)}

			{playerMode === "guest" && (
				<>
					<input
						type="text"
						placeholder="Display name"
						className="profile-input-field"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
					<div className="flex justify-between">
						<button className="mt-2 p-2" onClick={handleGoBack}>
							← Go back
						</button>

						<button className="mt-2 p-2" onClick={handleGuestContinue}>
							Continue ➜
						</button>
					</div>
				</>
			)}
		</div>
	)
};

export default PlayerLoginForm
