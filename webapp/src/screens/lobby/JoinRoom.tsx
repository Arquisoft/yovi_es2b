import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../socket";
import type { OnlineGameInfo } from "./OnlineGameInfo";
import "./Lobby.css";

interface JoinRoomProps {
  username: string;
  onGameReady: (info: OnlineGameInfo) => void;
  onBack: () => void;
}

export default function JoinRoom({ username, onGameReady, onBack }: Readonly<JoinRoomProps>) {
  const [inputCode, setInputCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Refs para tener valores actualizados dentro de los handlers del socket
  const inputCodeRef = useRef("");
  const joinedInfoRef = useRef<Partial<OnlineGameInfo> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room-joined', ({ code, gameId, difficulty, opponentUsername }: {
      code: string;
      gameId: string;
      playerIndex: number;
      difficulty: string;
      opponentUsername: string;
    }) => {
      joinedInfoRef.current = { code, gameId, playerIndex: 1, difficulty, opponentUsername };
      setJoined(true);
    });

    socket.on('game-start', ({ gameId, difficulty, players, timerEnabled }: {
      gameId: string;
      difficulty: string;
      timerEnabled: boolean;
      players: { username: string; playerIndex: number }[];
    }) => {
      const opponent = players.find(p => p.playerIndex === 0);
      const info = joinedInfoRef.current;
      onGameReady({
        gameId,
        code: info?.code ?? inputCodeRef.current,
        playerIndex: 1,
        opponentUsername: opponent?.username ?? info?.opponentUsername ?? '',
        difficulty,
        timerEnabled,
      });
    });

    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setJoined(false);
    });

    function handleBeforeUnload() {
      const info = joinedInfoRef.current;
      if (info?.code) {
        getSocket().emit('abandon-game', { code: info.code });
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('room-joined');
      socket.off('game-start');
      socket.off('room-error');
    };
  }, [onGameReady]);

  function handleBack() {
    const info = joinedInfoRef.current;
    if (info?.code) {
      getSocket().emit('abandon-game', { code: info.code });
    }
    onBack();
  }

  function handleJoin() {
    if (!inputCode.trim()) {
      setError("Introduce el código de la sala");
      return;
    }
    setError(null);
    inputCodeRef.current = inputCode.toUpperCase();
    getSocket().emit('join-room', { code: inputCode.toUpperCase(), username });
  }

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
        <img src="/yovi_logo.png" alt="YOVI Logo" className="lobby-logo" />
        <h2 className="lobby-card__title">Unirse a sala online</h2>

        {!joined && (
          <>
            <label className="lobby-card__label" htmlFor="room-code">Código de sala</label>
            <input
              id="room-code"
              className="lobby-input"
              type="text"
              placeholder="Ej: ABC123"
              maxLength={6}
              value={inputCode}
              onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setError(null); }}
            />

            {error && <p className="lobby-error">{error}</p>}

            <button className="lobby-btn lobby-btn--primary" onClick={handleJoin}>
              Unirse
            </button>
          </>
        )}

        {joined && (
          <p className="lobby-waiting__text">Conectado. Iniciando partida…</p>
        )}

        <button className="lobby-btn lobby-btn--back" onClick={handleBack}>
          Volver
        </button>
      </div>
    </div>
  );
}
