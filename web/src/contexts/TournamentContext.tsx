import type { ReactNode } from "react"
import React, { createContext, useContext, useState } from 'react';

export type TournamentContext = {
	tournamentId: number;
	players: {
		player1: {id:number; name: string; avatar:string; };
		player2: {id:number; name:string; avatar:string; };
		player3: {id:number; name:string; avatar:string; };
		player4: {id:number; name:string; avatar:string; };
	}
	bracket: {
		round1:{
			gameId: number;
			player1Key: 'player1' | 'player2' | 'player3' | 'player4';
			player2Key: 'player1' | 'player2' | 'player3' | 'player4';
			winner?: 'player1Key' | 'player2Key';
		};
		round2:{
			gameId: number;
			player1Key: 'player1' | 'player2' | 'player3' | 'player4';
			player2Key: 'player1' | 'player2' | 'player3' | 'player4';
			winner?: 'player1Key' | 'player2Key';
		};
		round3:{
			gameId: number;
			player1Key: 'player1' | 'player2' | 'player3' | 'player4';
			player2Key: 'player1' | 'player2' | 'player3' | 'player4';
			winner?: 'player1Key' | 'player2Key';
		};
	}
}
