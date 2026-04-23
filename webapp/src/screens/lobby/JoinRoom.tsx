import { useState, useEffect } from "react";
import { getSocket } from "../../socket";
import type { OnlineGameInfo } from "./OnlineGameInfo";
import "./Lobby.css";

interface JoinRoomProps {
  username: string;
  onGameReady: (info: OnlineGameInfo) => void;
  onBack: () => void;
}

export default function JoinRoom({ username, onGameReady, onBack }: JoinRoomProps) {
  const [inputCode, setInputCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<Partial<OnlineGameInfo> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room-joined', ({ code, gameId, difficulty, opponentUsername }: {
      code: string;
      gameId: string;
      playerIndex: number;
      difficulty: string;
      opponentUsername: string;
    }) => {
      setJoined(true);
      setGameInfo({ code, gameId, playerIndex: 1, difficulty, opponentUsername });
    });

    socket.on('game-start', ({ gameId, difficulty, players }: {
      gameId: string;
      difficulty: string;
      players: { username: string; playerIndex: number }[];
    }) => {
      const opponent = players.find(p => p.playerIndex === 0);
      const info = gameInfo;
      const resolvedCode = info?.code ?? inputCode.toUpperCase();
      onGameReady({
        gameId,
        code: resolvedCode,
        playerIndex: 1,
        opponentUsername: opponent?.username ?? info?.opponentUsername ?? '',
        difficulty,
      });
    });

    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setJoined(false);
    });

    return () => {
      socket.off('room-joined');
      socket.off('game-start');
      socket.off('room-error');
    };
  }, [gameInfo, inputCode, onGameReady]);

  function handleJoin() {
    if (!inputCode.trim()) {
      setError("Introduce el código de la sala");
      return;
    }
    setError(null);
    getSocket().emit('join-room', { code: inputCode.toUpperCase(), username });
  }

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
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

        <button className="lobby-btn lobby-btn--back" onClick={onBack}>
          Volver
        </button>
      </div>
    </div>
  );
}
