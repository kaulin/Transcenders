import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import type { Player } from "../types/types"

type PlayersMap = Record<number, Player>

type PlayersContextType = {
	players: PlayersMap
	setPlayer: (playerNumber: number, data: Player) => void
	resetPlayer: (playerNumber: number) => void
	resetAll: () => void
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined)

export function PlayersProvider({ children }: { children: ReactNode }) {
	const [players, setPlayers] = useState<PlayersMap>({})

	const setPlayer = (num: number, data: Player) => {
		setPlayers(prev => ({
			...prev,
			[num]: {
				...prev[num],
				...data
			}
		}))
	}

	const resetPlayer = (num: number) => {
		setPlayers(prev => {
			const newPlayers = { ...prev }
			delete newPlayers[num]
			return newPlayers
		})
	}

	const resetAll = () => setPlayers({})

	return (
		<PlayersContext.Provider value={{ players, setPlayer, resetPlayer, resetAll }}>
			{children}
		</PlayersContext.Provider>
	)
}

export function usePlayers() {
	const context = useContext(PlayersContext)
	if (!context) {
		throw new Error("")
	}
	
	return context
}
