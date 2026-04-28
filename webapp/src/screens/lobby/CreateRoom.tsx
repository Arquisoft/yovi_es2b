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

  const { t } = useLanguageContext(); // para internacionalizar

  const [difficulty, setDifficulty] = useState<DifficultyType>(Difficulty.MEDIUM); // Estado para almacenar la dificultad seleccionada, por defecto "MEDIUM"
  const [timerEnabled, setTimerEnabled] = useState(true); // Estado para almacenar si el temporizador está habilitado, por defecto "true"
  const [code, setCode] = useState<string | null>(null); // Estado para almacenar el código de la sala creada, inicialmente null porque no se ha creado ninguna sala
  const [waiting, setWaiting] = useState(false); // Estado para indicar si se está esperando a que un rival se conecte, inicialmente false porque no se ha creado ninguna sala
  const [error, setError] = useState<string | null>(null); // Estado para almacenar el mensaje de error en caso de que ocurra algún error al crear la sala o durante la espera

  // Ref para tener siempre el código actualizado dentro de los handlers del socket
  const codeRef = useRef<string | null>(null); // Ref para tener siempre el estado del temporizador actualizado dentro de los handlers del socket
  const timerEnabledRef = useRef(true); // Ref para tener siempre el estado del temporizador actualizado dentro de los handlers del socket


  useEffect(() => {
    const socket = getSocket(); // Obtiene la instancia del socket para comunicarse con el backend

    // Handler para el evento "room-created" que se emite desde el backend cuando se crea una sala. 
    // Actualiza el estado con el código de la sala y muestra la pantalla de espera.
    socket.on('room-created', ({ code: roomCode }: { code: string; gameId: string; playerIndex: number }) => {
      codeRef.current = roomCode;
      setCode(roomCode);
      setWaiting(true);
    });

    // Handler para el evento "game-start" que se emite desde el backend cuando un rival se conecta a la sala y el juego está listo para comenzar.
    // Llama a la función onGameReady con la información del juego para iniciarlo.
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

    // Handler para el evento "room-error" que se emite desde el backend si ocurre algún error al crear la sala o durante la espera.
    // Actualiza el estado con el mensaje de error y deja de mostrar la pantalla de espera.
    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setWaiting(false);
    });

    /**
     * Funcion para cuando el usuario intente cerrar la pestaña o recargar la página mientras está en la pantalla de espera, para evitar que se quede una sala huérfana en el backend.
     * Emite el evento "abandon-game" al backend con el código de la sala para que el backend pueda eliminar la sala y liberar los recursos asociados.
     */
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

  /**
   * Funcion para manejar el botón de volver, para abandonar la sala si se ha creado y volver al menú principal.
   * Si se ha creado una sala (codeRef.current no es null), emite el evento "abandon-game" al backend con el código de la sala 
   * Luego llama a la función onBack para volver al menú principal.
   */
  function handleBack() {
    if (codeRef.current) {
      getSocket().emit('abandon-game', { code: codeRef.current });
    }
    onBack();
  }

  /**
   * Funcion para manejar el botón de crear sala, para enviar la solicitud al backend con las opciones seleccionadas.
   * Emite el evento "create-room" al backend con el nombre de usuario, la dificultad seleccionada y si el temporizador está habilitado. 
   * También actualiza el ref del temporizador para que esté actualizado en los handlers del socket.
   */
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
