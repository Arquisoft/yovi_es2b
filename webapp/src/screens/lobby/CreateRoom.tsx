import { useState, useEffect } from "react";
import { getSocket } from "../../socket";
import { Difficulty } from "../../components/gameOptions/Difficulty";
import type { DifficultyType } from "../../components/gameOptions/Difficulty";
import type { OnlineGameInfo } from "./OnlineGameInfo";
import "./Lobby.css";

interface CreateRoomProps {
  username: string;
  onGameReady: (info: OnlineGameInfo) => void;
  onBack: () => void;
}

export default function CreateRoom({ username, onGameReady, onBack }: CreateRoomProps) {
  const [difficulty, setDifficulty] = useState<DifficultyType>(Difficulty.MEDIUM);
  const [code, setCode] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room-created', ({ code: roomCode }: { code: string; gameId: string; playerIndex: number }) => {
      setCode(roomCode);
      setWaiting(true);
    });

    socket.on('game-start', ({ gameId, difficulty: diff, players }: {
      gameId: string;
      difficulty: string;
      players: { username: string; playerIndex: number }[];
    }) => {
      const opponent = players.find(p => p.playerIndex === 1);
      if (!opponent || !code) return;
      onGameReady({
        gameId,
        code: code,
        playerIndex: 0,
        opponentUsername: opponent.username,
        difficulty: diff,
      });
    });

    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setWaiting(false);
    });

    return () => {
      socket.off('room-created');
      socket.off('game-start');
      socket.off('room-error');
    };
  }, [code, onGameReady]);

  function handleCreate() {
    setError(null);
    getSocket().emit('create-room', { username, difficulty });
  }

  function handleCopy() {
    if (code) navigator.clipboard.writeText(code);
  }

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
        <h2 className="lobby-card__title">Crear sala online</h2>

        {!code && (
          <>
            <span className="lobby-card__label">Tamaño del tablero</span>
            <div className="lobby-difficulty">
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.EASY ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.EASY)}>Pequeño</button>
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.MEDIUM ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.MEDIUM)}>Mediano</button>
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.HARD ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.HARD)}>Grande</button>
            </div>

            {error && <p className="lobby-error">{error}</p>}

            <button className="lobby-btn lobby-btn--primary" onClick={handleCreate}>
              Crear sala
            </button>
          </>
        )}

        {code && (
          <div className="lobby-waiting">
            <p className="lobby-card__label">Comparte este código con tu rival:</p>
            <div className="lobby-code-box">
              <span className="lobby-code">{code}</span>
              <button className="lobby-btn lobby-btn--copy" onClick={handleCopy} title="Copiar">
                📋
              </button>
            </div>
            {waiting && (
              <p className="lobby-waiting__text">Esperando a que tu rival se conecte…</p>
            )}
          </div>
        )}

        <button className="lobby-btn lobby-btn--back" onClick={onBack}>
          Volver
        </button>
      </div>
    </div>
  );
}
