import { useEffect, useState } from "react";

import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import type { GameSettings } from "../../gameOptions/GameSettings";
import { getBoardSize } from "../../gameOptions/Difficulty";
import "./Game.css";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
  username2: string;
  twoPlayers: boolean;
  stateStart: boolean;
}

/**
 * Declaración primera de esto, para que funcione el guardar datos de la partida
 * Recibe el tamaño del tablero para crear el juego y retorna el id que tendra.
 */
async function crearPartida(boardSize: number): Promise<string> {
    const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    const res = await fetch(`${GAMEY_URL}/v1/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_size: boardSize }),
    });
    if (!res.ok) throw new Error("Error al crear la partida");
    const data = await res.json();
      //Return gameID
      return data.game_id;
}

async function getTurnoPartida(gameId: string): Promise<number> {
   const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    const res = await fetch(`${GAMEY_URL}/v1/games/${gameId}/status`);
    if (!res.ok) {
      throw new Error("Error al obtener el turno");
    } 
    const data = await res.json();
    return data.kind === 'Ongoing' ? data.next_player : 0;
}

export function Game({ settings, username, username2, twoPlayers, stateStart }: GameProps) {
  // en caso de necesitar mas atributos, crear cosas aquí y async functions que ayuden a esto
  const [turno, setTurno] = useState("Inicio");
  const [gameState, setGameState] = useState("Inicio");
  const [gameId, setGameId] = useState("");

  // como es función async, llamamos useEffect
  useEffect(() => {
    async function nuevaPartida() {
      if (stateStart) {
        const boardSize = getBoardSize(settings.difficulty); // Consigue el tamaño del tablero
        const idG = await crearPartida(boardSize);           // Crea la partida y asigna el idGame
        setGameId(idG);

        // para cada atributo
        const nextPlayer = await getTurnoPartida(idG);
        setTurno(nextPlayer === 0 ? username : twoPlayers ? username2 : "BOT");
        setGameState("Iniciada");
      }
    }
    nuevaPartida();
  }, [stateStart]);

  return (
    <div className="game-screen">
      <div className="game-panel">

        <div className="game-info">
          <GameInfo
            settings={settings}
            currentPlayer={turno}
            gameStatus={gameState}
          />
        </div>

        <div className="board-main">
          <Board
            strategy={settings.strategy}
            difficulty={settings.difficulty}
            gameId={gameId}
            turno={turno}
            gameState={gameState}
            username={username}
            username2={username2}
            twoPlayers={twoPlayers}
            changeTurno={setTurno}
            changeGameState={setGameState}
          />
        </div>

        <div className="controls-bottom">
          <ControlPanel username={username} />
        </div>
      </div>
    </div>
  );
}