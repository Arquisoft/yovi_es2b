import { useEffect, useRef, useState } from "react";
import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import Timer from "../../components/timer/Timer";
import type { GameSettings } from "../../components/gameOptions/GameSettings";
import { getBoardSize } from "../../components/gameOptions/Difficulty";
import "./Game.css";
import { End } from "./End";
import Home from "./Home";
import { getSocket, disconnectSocket } from "../../socket";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
  username2: string;
  twoPlayers: boolean;
  stateStart: boolean;
  enableTimer?: boolean;
  onGoMenu?: () => void;
  onGameEnd?: (winner: string) => void;
  onPlayAgain?: () => void;
  // Modo online
  onlineMode?: boolean;
  roomCode?: string;
  localPlayerIndex?: number;
  initialGameId?: string;
}

// Tipo para actualizaciones de tablero que vienen del socket
export type BoardUpdate = {
  layout: string;
  status: { kind: string; next_player?: number; winner?: number };
  seq: number;
};

async function crearPartida(boardSize: number): Promise<string> {
    const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    const res = await fetch(`${GAMEY_URL}/v1/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_size: boardSize }),
    });
    if (!res.ok) throw new Error("Error al crear la partida");
    const data = await res.json();
    return data.game_id;
}

async function getTurnoPartida(gameId: string): Promise<number> {
   const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/status`);
    if (!res.ok) throw new Error("Error al obtener el turno");
    const data = await res.json();
    return data.kind === 'Ongoing' ? data.next_player : 0;
}

export function Game({
  settings, username, username2, twoPlayers, stateStart,
  enableTimer = true, onGoMenu = () => {}, onGameEnd, onPlayAgain,
  onlineMode = false, roomCode, localPlayerIndex = 0, initialGameId,
}: Readonly<GameProps>) {

  const [turno, setTurno] = useState("Inicio");
  const [gameState, setGameState] = useState("Inicio");
  const [gameId, setGameId] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [playAgain, setPlayAgain] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hintCoords, setHintCoords] = useState<{ x: number; y: number; z: number } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [externalBoardUpdate, setExternalBoardUpdate] = useState<BoardUpdate | null>(null);
  const [disconnectedMsg, setDisconnectedMsg] = useState<string | null>(null);
  const boardUpdateSeq = useRef(0);

  // Inicializar partida
  useEffect(() => {
    if (!stateStart) return;
    setWinner(null);
    setShowEndScreen(false);
    setTurno("Inicio");
    setGameState("Inicio");
    setGameId("");
    setHintsUsed(0);
    setExternalBoardUpdate(null);
    setDisconnectedMsg(null);

    if (onlineMode && initialGameId) {
      // La partida ya fue creada por el servicio de salas
      setGameId(initialGameId);
      // El jugador 0 siempre empieza; mapeamos al nombre local
      const firstTurno = localPlayerIndex === 0 ? username : username2;
      setTurno(firstTurno);
      setGameState("Iniciada");
      return;
    }

    async function nuevaPartida() {
      const boardSize = getBoardSize(settings.difficulty);
      const idG = await crearPartida(boardSize);
      setGameId(idG);
      const nextPlayer = await getTurnoPartida(idG);
      const firstTurno = nextPlayer === 0 ? username : (twoPlayers ? username2 : "BOT");
      setTurno(firstTurno);
      setGameState("Iniciada");
    }
    nuevaPartida();
  }, [stateStart, playAgain]);

  // Listeners de socket para modo online
  useEffect(() => {
    if (!onlineMode || !roomCode) return;

    const socket = getSocket();

    socket.on('move-made', (data: { state: { layout: string }; status: { kind: string; next_player?: number; winner?: number } }) => {
      boardUpdateSeq.current += 1;
      setExternalBoardUpdate({
        layout: data.state.layout,
        status: data.status,
        seq: boardUpdateSeq.current,
      });
    });

    socket.on('player-disconnected', ({ username: who }: { username: string }) => {
      setDisconnectedMsg(`${who} se ha desconectado. Partida terminada.`);
    });

    return () => {
      socket.off('move-made');
      socket.off('player-disconnected');
    };
  }, [onlineMode, roomCode]);

  // Limpiar socket al desmontar en modo online
  useEffect(() => {
    return () => {
      if (onlineMode) disconnectSocket();
    };
  }, [onlineMode]);

  // Mostrar pantalla de fin tras detectar ganador
  useEffect(() => {
    if (winner === null) { setShowEndScreen(false); return; }
    const timerId = window.setTimeout(() => setShowEndScreen(true), 1000);
    return () => window.clearTimeout(timerId);
  }, [winner]);

  function handleGameEnd(ganador: string) {
    setWinner(ganador);
    setGameState("Terminada");
    onGameEnd?.(ganador);
  }

  function handleTimerExpire() {
    setTurno((t) => (t === username ? username2 : username));
  }

  // Movimiento online: emite al servicio de salas en lugar de llamar a GameY
  function handleOnlineMove(x: number, y: number, z: number, player: number) {
    if (!roomCode) return;
    getSocket().emit('make-move', { code: roomCode, x, y, z, player });
  }

  async function handleHint() {
    if (onlineMode) return; // sin pistas en modo online
    if (!/^[a-zA-Z0-9_-]+$/.test(gameId)) return;
    const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    try {
      const stateRes = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}`);
      if (!stateRes.ok) return;
      const stateData = await stateRes.json();
      const hintParams = new URLSearchParams({
        position: JSON.stringify(stateData.state),
        bot_id: 'montecarlo_bot',
      });
      const hintRes = await fetch(`${GAMEY_URL}/play?${hintParams}`);
      if (!hintRes.ok) return;
      const hint = await hintRes.json();
      setHintCoords(hint.coords);
      setHintsUsed((n) => n + 1);
    } catch (err) {
      console.error("Error al obtener pista:", err);
    }
  }

  async function handleUndo() {
    if (onlineMode && roomCode) {
      // En online el servicio deshace dos movimientos y hace broadcast
      getSocket().emit('undo-move', { code: roomCode });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(gameId)) return;
    const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';
    try {
      const veces = twoPlayers ? 1 : 2;
      for (let i = 0; i < veces; i++) {
        const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/undo`, { method: 'POST' });
        if (!res.ok) break;
      }
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Error al deshacer movimiento:", err);
    }
  }

  async function handleExit() {
    if (onlineMode && roomCode) {
      getSocket().emit('abandon-game', { code: roomCode });
    }
    onGoMenu();
    setGameState("fin");
  }

  // Mensaje de desconexión del rival
  if (disconnectedMsg) {
    return (
      <div className="game-screen">
        <div className="game-panel" style={{ alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>{disconnectedMsg}</p>
          <button className="game-exit-btn" onClick={() => { onGoMenu(); }}>
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "fin") {
    return <Home username={username}/>;
  }

  if (winner !== null && showEndScreen) {
    return (
      <End
        winner={winner}
        username={username}
        username2={username2}
        twoPlayers={twoPlayers}
        settings={settings}
        onGoHome={onGoMenu}
        onPlayAgain={() => {
          if (!onlineMode) {
            setPlayAgain((prev) => !prev);
            onPlayAgain?.();
          } else {
            onGoMenu();
          }
        }}
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
              {!onlineMode && enableTimer && gameState === "Iniciada" && (
                <Timer turno={turno} onExpire={handleTimerExpire} />
              )}
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
            hintCoords={hintCoords}
            changeTurno={(t) => { setTurno(t); setHintCoords(null); }}
            onGameEnd={handleGameEnd}
            onlineMode={onlineMode}
            localPlayerIndex={localPlayerIndex}
            onOnlineMove={handleOnlineMove}
            externalBoardUpdate={externalBoardUpdate}
          />
        </div>

        <div className="controls-bottom">
          {!twoPlayers && (
            <div id="hint-container">
              <button id="hint-button" onClick={handleHint} disabled={hintCoords !== null || hintsUsed >= 3}>Pista</button>
              <span id="hint-counter">{3 - hintsUsed} pista{3 - hintsUsed === 1 ? "" : "s"} restante{3 - hintsUsed === 1 ? "" : "s"}</span>
            </div>
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
