import { useEffect, useState } from "react";
import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import type { GameSettings } from "../../components/gameOptions/GameSettings";
import { getBoardSize } from "../../components/gameOptions/Difficulty";
import "./Game.css";
import { End } from "./End";
import Home from "./Home";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
  username2: string;
  twoPlayers: boolean;
  stateStart: boolean;
  onGoMenu?: () => void;
  onGameEnd?: (winner: string) => void;
  onPlayAgain?: () => void;
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

export function Game({ settings, username, username2, twoPlayers, stateStart, onGoMenu = () => {}, onGameEnd, onPlayAgain }: Readonly<GameProps>) {
  // en caso de necesitar mas atributos, crear cosas aquí y async functions que ayuden a esto
  const [turno, setTurno] = useState("Inicio");
  const [gameState, setGameState] = useState("Inicio");
  const [gameId, setGameId] = useState("");
  const [winner, setWinner] = useState<string | null>(null); // ganador de la partida, null si no hay ganador aún
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [playAgain, setPlayAgain] = useState(false); // toggle para reiniciar la partida sin volver al menú principal
  const [refreshKey, setRefreshKey] = useState(0);  // incrementar fuerza recarga del tablero

  // como es función async, llamamos useEffect
  useEffect(() => {
    // Reinicia todo el estado cuando el padre cambie stateStart o el usuario pulse "Jugar de nuevo"
    if (!stateStart){
      return;
    } 
    setWinner(null);
    setShowEndScreen(false);
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
        let firstTurno: string;
        if (nextPlayer === 0) {
          firstTurno = username;
        } else {
          firstTurno = twoPlayers ? username2 : "BOT";
        }
        setTurno(firstTurno);
        setGameState("Iniciada");
      }
    }
    nuevaPartida();
  }, [stateStart, playAgain]);

  // Efecto para mostrar la pantalla de fin 3 segundos después de detectar un ganador
  useEffect(() => {
    // Si el ganador vuelve a ser null (ej. nueva partida), ocultamos la pantalla de fin inmediatamente
    if (winner === null) {
      setShowEndScreen(false);
      return;
    }
    // Si hay un ganador, programamos mostrar la pantalla de fin después de 1 segundos
    const timerId = window.setTimeout(() => {
      setShowEndScreen(true);
    }, 1000);
    // Limpiamos el timeout si el componente se desmonta o si se inicia una nueva partida
    return () => {
      window.clearTimeout(timerId);
    };
  }, [winner]);

  /**
   * Funcion para manejar el fin de la partida, llamando a la pantalla de fin y guardando el resultado
   * Board debe llamar a changeGameState("Terminada") y a un nuevo prop onGameEnd(winner)
   * cuando detecte que la partida acabó. Aquí lo capturamos
   */  
  function handleGameEnd(ganador: string) {
    setWinner(ganador);
    setGameState("Terminada");
    onGameEnd?.(ganador); // notify parent if provided

  }

  async function handleUndo() {
    const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    try {
      // En partida vs bot deshacemos 2 movimientos (el del bot y el del jugador)
      const veces = twoPlayers ? 1 : 2;
      for (let i = 0; i < veces; i++) {
        const res = await fetch(`${GAMEY_URL}/v1/games/${gameId}/undo`, { method: 'POST' });
        if (!res.ok) break;
      }
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Error al deshacer movimiento:", err);
    }
  }

  async function handleExit() {
    setGameState("fin");
  }

  // Si el usuario pulsa "Terminar partida" en el panel de control, volvemos al menú principal
  if(gameState==="fin") {
    return <Home username={username}/>;
  }

  // Mostrar pantalla de fin 3 segundos después de detectar ganador
  if (winner !== null && showEndScreen) {
    return (
      <End
        winner={winner}
        username={username}
        username2={username2}
        twoPlayers={twoPlayers}
        settings={settings}
        onGoHome={onGoMenu}
        onPlayAgain={() => { setPlayAgain((prev) => !prev); onPlayAgain?.(); }} // toggle dispara el useEffect
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
            twoPlayers={twoPlayers}
          />
        </div>

        <div className="board-main">
          {twoPlayers && (
            <div className="turn-indicator">
              <span className="turn-indicator__label">Turno de</span>
              <span
                className="turn-indicator__player"
                style={{ color: turno === username ? "#0c55c0" : "#b91c1c" }}
              >
                {turno}
              </span>
            </div>
          )}
          <Board
            strategy={settings.strategy}
            difficulty={settings.difficulty}
            gameId={gameId}
            turno={turno}
            gameState={gameState}
            username={username}
            username2={username2}
            twoPlayers={twoPlayers}
            refreshKey={refreshKey}
            changeTurno={setTurno}
            onGameEnd={handleGameEnd}
          />
        </div>

        <div className="controls-bottom">
          {!twoPlayers && (
            <button id="hint-button" onClick={() => {}}>Pista</button>
          )}
          <ControlPanel
            onExit={handleExit}
            onUndo={handleUndo}
            twoPlayers={twoPlayers}
          />
        </div>
      </div>
    </div>
  );
}