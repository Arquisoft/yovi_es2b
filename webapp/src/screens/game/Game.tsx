import { useEffect, useState } from "react";

import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import type { GameSettings } from "../../gameOptions/GameSettings";
import { getBoardSize } from "../../gameOptions/Difficulty";
import "./Game.css";
import { End } from "./End";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
  stateStart: boolean;
  onGoMenu: () => void;
  onGameEnd: (winner: string) => void;
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

export function Game({ settings, username, stateStart, onGoMenu, onGameEnd  }: GameProps) {
  // en caso de necesitar mas atributos, crear cosas aquí y async functions que ayuden a esto
  const [turno, setTurno] = useState("Inicio");
  const [gameState, setGameState] = useState("Inicio");
  const [gameId, setGameId] = useState("");
  const [winner, setWinner] = useState<string | null>(null); // ganador de la partida, null si no hay ganador aún
  const [playAgain, setPlayAgain] = useState(false); // toggle para reiniciar la partida sin volver al menú principal 

  // como es función async, llamamos useEffect
  useEffect(() => {
    // Reinicia todo el estado cuando el padre cambie stateStart o el usuario pulse "Jugar de nuevo"
    if (!stateStart){
      return;
    } 
    setWinner(null);
    setTurno("Inicio");
    setGameState("Inicio");
    setGameId("");

    async function nuevaPartida() {
      if (stateStart) {
        const boardSize = getBoardSize(settings.difficulty); // Consigue el tamaño del tablero
        const idG = await crearPartida(boardSize);           // Crea la partida y asigna el idGame
        setGameId(idG);

        // para cada atributo
        const nextPlayer = await getTurnoPartida(idG);
        setTurno(nextPlayer === 0 ? username : "BOT"); // Si es 0 es el anfitrion
        setGameState("Iniciada");
      }
    }
    nuevaPartida();
  }, [stateStart, playAgain]);

  /**
   *  Funcion para manejar el fin de la partida, llamando a la pantalla de fin y guardando el resultado
   * Board debe llamar a changeGameState("Terminada") y a un nuevo prop onGameEnd(winner)
   * cuando detecte que la partida acabó. Aquí lo capturamos
   */  
  function handleGameEnd(ganador: string) {
    setWinner(ganador);
    setGameState("Terminada");
    onGameEnd(ganador); // notify parent

  }

  // Mostrar pantalla de fin si hay ganador
  if (winner !== null) {
    return (
      <End
        winner={winner}
        username={username}
        settings={settings}
        onGoHome={onGoMenu}
        onPlayAgain={() => setPlayAgain((prev) => !prev)} // toggle dispara el useEffect
      />
    );
  }

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
            changeTurno={setTurno}
            changeGameState={setGameState}
            onGameEnd={handleGameEnd}
          />
        </div>

        <div className="controls-bottom">
          <ControlPanel username={username} />
        </div>
      </div>
    </div>
  );
}