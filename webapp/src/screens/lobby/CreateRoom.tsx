import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../socket";
import { Difficulty } from "../../components/gameOptions/Difficulty";
import type { DifficultyType } from "../../components/gameOptions/Difficulty";
import type { OnlineGameInfo } from "./OnlineGameInfo";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./Lobby.css";

interface CreateRoomProps {
  username: string;
  onGameReady: (info: OnlineGameInfo) => void;
  onBack: () => void;
}

export default function CreateRoom({ username, onGameReady, onBack }: Readonly<CreateRoomProps>) {
  const { t } = useLanguageContext();
  const [difficulty, setDifficulty] = useState<DifficultyType>(Difficulty.MEDIUM);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref para tener siempre el código actualizado dentro de los handlers del socket
  const codeRef = useRef<string | null>(null);
  const timerEnabledRef = useRef(true);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room-created', ({ code: roomCode }: { code: string; gameId: string; playerIndex: number }) => {
      codeRef.current = roomCode;
      setCode(roomCode);
      setWaiting(true);
    });

    socket.on('game-start', ({ gameId, difficulty: diff, players, timerEnabled: te }: {
      gameId: string;
      difficulty: string;
      timerEnabled: boolean;
      players: { username: string; playerIndex: number }[];
    }) => {
      const opponent = players.find(p => p.playerIndex === 1);
      if (!opponent || !codeRef.current) return;
      onGameReady({
        gameId,
        code: codeRef.current,
        playerIndex: 0,
        opponentUsername: opponent.username,
        difficulty: diff,
        timerEnabled: te,
      });
    });

    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setWaiting(false);
    });

    function handleBeforeUnload() {
      if (codeRef.current) {
        getSocket().emit('abandon-game', { code: codeRef.current });
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('room-created');
      socket.off('game-start');
      socket.off('room-error');
    };
  }, [onGameReady]);

  function handleBack() {
    if (codeRef.current) {
      getSocket().emit('abandon-game', { code: codeRef.current });
    }
    onBack();
  }

  function handleCreate() {
    setError(null);
    timerEnabledRef.current = timerEnabled;
    getSocket().emit('create-room', { username, difficulty, timerEnabled });
  }

  return (
    <div className="lobby-screen">
      <img src="/yovi_logo.png" alt={t('common.logoAlt')} className="lobby-logo" />
      <div className="lobby-card">
        <h2 className="lobby-card__title">{t('rooms.createRoomTitle')}</h2>

        {!code && (
          <>
            <span className="lobby-card__label">{t('rooms.boardSize')}</span>
            <div className="lobby-difficulty">
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.EASY ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.EASY)}>{t('rooms.small')}</button>
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.MEDIUM ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.MEDIUM)}>{t('rooms.medium')}</button>
              <button
                className={`lobby-diff-btn${difficulty === Difficulty.HARD ? " lobby-diff-btn--active" : ""}`}
                onClick={() => setDifficulty(Difficulty.HARD)}>{t('rooms.large')}</button>
            </div>

            <span className="lobby-card__label">{t('rooms.timer')}</span>
            <label className="home-toggle" htmlFor="timer-enabled-online">
              <span className="home-toggle__text">{t('rooms.timerActive')}</span>
              <span className="home-toggle__control">
                <input
                  id="timer-enabled-online"
                  className="home-toggle__input"
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                />
                <span className="home-toggle__slider" aria-hidden="true" />
              </span>
            </label>

            {error && <p className="lobby-error">{error}</p>}

            <button className="lobby-btn lobby-btn--primary" onClick={handleCreate}>
              {t('rooms.createRoomButton')}
            </button>
          </>
        )}

        {code && (
          <div className="lobby-waiting">
            <p className="lobby-card__label">{t('rooms.shareCode')}</p>
            <span className="lobby-code">{code}</span>
            {waiting && (
              <p className="lobby-waiting__text">{t('rooms.waitingRival')}</p>
            )}
          </div>
        )}

        <button className="lobby-btn lobby-btn--back" onClick={handleBack}>
          {t('rooms.back')}
        </button>
      </div>
    </div>
  );
}
