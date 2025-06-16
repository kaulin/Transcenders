import { useState } from "react"

const PlayerLoginForm = ({
	playerNumber,
	onContinue,
	onGoBack,
	isReady
}: {
	playerNumber: number,
	onContinue: (playerNumber: number) => void,
	onGoBack: (playerNumber: number) => void,
	isReady?: boolean
}) => {
	const [playerMode, setPlayerMode] = useState<"guest" | "login" | null>(null)
	const [username, setUsername] = useState<string | null>(null)
	const [password, setPassword] = useState<string | null>(null)
	const [continued, setContinued] = useState<boolean>(false)

	const handleContinue = () => {
		setContinued(true)
		onContinue(playerNumber)
	}

	const handleBack = () => {
		setContinued(false)
		setPlayerMode(null)
		onGoBack(playerNumber)
	}

	if (isReady) {
		return (
			<>
				<h2 className="profile-label">Player {playerNumber}</h2>
				<p className="border-b-2 border-white text-lg">Username</p>
				<div className="flex justify-between">
					<button
						className="mt-2 p-2"
						onClick={handleBack}
					>
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
					<button
						className="profile-button mt-0"
						onClick={() => setPlayerMode("guest")}
					>
						Play as Guest
					</button>
					<button
						className="profile-button mt-0"
						onClick={() => setPlayerMode("login")}
					>
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
					/>
					<input
						type="Password"
						placeholder="password"
						className="profile-input-field"
					/>
					<div className="flex justify-between">
						<button
							className="mt-2 p-2"
							onClick={handleBack}
						>
							← Go back
						</button>

					{continued ? (
						<p className="text-lg pt-4">✓</p>
					) : (
						<button
							className="mt-2 p-2"
							onClick={handleContinue}
						>
							Continue ➜
						</button>
					)}
					</div>
				</>
			)}

			{playerMode === "guest" && (
				<>
					<input
						type="text"
						placeholder="Display name"
						className="profile-input-field"
					/>
					<div className="flex justify-between">
						<button
							className="mt-2 p-2"
							onClick={handleBack}
						>
							← Go back
						</button>

					{continued ? (
						<p className="text-lg pt-4">✓</p>
					) : (
						<button
							className="mt-2 p-2"
							onClick={handleContinue}
						>
							Continue ➜
						</button>
					)}
					</div>
				</>
			)}
		</div>
	)
};

export default PlayerLoginForm
