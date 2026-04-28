import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../socket";
import type { OnlineGameInfo } from "./OnlineGameInfo";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./Lobby.css";

interface JoinRoomProps {
  username: string;
  onGameReady: (info: OnlineGameInfo) => void;
  onBack: () => void;
}

/**
 * Funcion para unirse a una sala de juego online existente. Permite al usuario:
 * - Ingresar un código de sala para unirse a esa sala, 
 * - Manejar la comunicación con el backend a través de sockets para unirse a la sala
 * Al unirse a la sala, espera a que el juego comience y luego llama a la función onGameReady con la información del juego para iniciar la partida.
 * Si el usuario intenta volver o cerrar la pestaña mientras está en la sala, emite un evento al backend para abandonar la sala y evitar que quede una sala huérfana.
 */
export default function JoinRoom({ username, onGameReady, onBack }: Readonly<JoinRoomProps>) {
<<<<<<< HEAD
  const { t } = useLanguageContext();
  const [inputCode, setInputCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
=======
  const [inputCode, setInputCode] = useState(""); // Estado para almacenar el código de sala ingresado por el usuario
  const [joined, setJoined] = useState(false); //Estado para indicar si el usuario se ha unido a la sala, inicialmente false porque no se ha unido a ninguna sala
  const [error, setError] = useState<string | null>(null); // Estado para almacenar el mensaje de error en caso de que ocurra algún error al unirse a la sala o durante la espera
>>>>>>> 1110dc760670d7b81e57199fd2170f42248717cd
  // Refs para tener valores actualizados dentro de los handlers del socket
  const inputCodeRef = useRef(""); // Ref para tener siempre el código de sala actualizado dentro de los handlers del socket
  const joinedInfoRef = useRef<Partial<OnlineGameInfo> | null>(null); // Ref para tener siempre la información de la sala a la que se ha unido el usuario actualizada 

  useEffect(() => {
    const socket = getSocket(); // Obtiene la instancia del socket para comunicarse con el backend

    // Handler para el evento "room-joined" que se emite desde el backend cuando el usuario se une a una sala. 
    // Actualiza el estado para mostrar la pantalla de espera y guarda la información de la sala a la que se ha unido el usuario en un ref para tenerla disponible en los handlers del socket.
    socket.on('room-joined', ({ code, gameId, difficulty, opponentUsername }: {
      code: string;
      gameId: string;
      playerIndex: number;
      difficulty: string;
      opponentUsername: string;
    }) => {
      joinedInfoRef.current = { code, gameId, playerIndex: 1, difficulty, opponentUsername }; 
      //Guarda la información de la sala a la que se ha unido el usuario en un ref para tenerla disponible en los handlers del socket
      setJoined(true);
    });

    /**
     * Handler para el evento "game-start" que se emite desde el backend cuando el juego está listo para comenzar después de que el usuario se ha unido a la sala.
     * Llama a la función onGameReady con la información del juego para iniciarlo.
     * Si el usuario no se ha unido a ninguna sala (joinedInfoRef.current es null), no hace nada.
     */
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

    // Handler para el evento "room-error" que se emite desde el backend si ocurre algún error al unirse a la sala o durante la espera.
    // Actualiza el estado con el mensaje de error y deja de mostrar la pantalla de espera.
    socket.on('room-error', ({ message }: { message: string }) => {
      setError(message);
      setJoined(false);
    });

    //Funcion para cuando el usuario intente cerrar la pestaña o recargar la página mientras está en la pantalla de espera, para evitar que se quede una sala huérfana en el backend.
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

  // Funcion para manejar el botón de volver, para abandonar la sala si se ha unido a alguna y volver al menú principal.
  function handleBack() {
    const info = joinedInfoRef.current;
    if (info?.code) {
      getSocket().emit('abandon-game', { code: info.code });
    }
    onBack();
  }

  // Funcion para manejar el botón de unirse a la sala, para enviar la solicitud al backend con el código de sala ingresado.
  function handleJoin() {
    if (!inputCode.trim()) {
      setError(t('rooms.errorEmptyCode'));
      return;
    }
    setError(null);
    inputCodeRef.current = inputCode.toUpperCase();
    getSocket().emit('join-room', { code: inputCode.toUpperCase(), username });
  }

  return (
    <div className="lobby-screen">
      <img src="/yovi_logo.png" alt={t('common.logoAlt')} className="lobby-logo" />
      <div className="lobby-card">
        <h2 className="lobby-card__title">{t('rooms.joinRoomTitle')}</h2>

        {!joined && (
          <>
            <label className="lobby-card__label" htmlFor="room-code">{t('rooms.roomCode')}</label>
            <input
              id="room-code"
              className="lobby-input"
              type="text"
              placeholder={t('rooms.roomCodePlaceholder')}
              maxLength={6}
              value={inputCode}
              onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setError(null); }}
            />

            {error && <p className="lobby-error">{error}</p>}

            <button className="lobby-btn lobby-btn--primary" onClick={handleJoin}>
              {t('rooms.joinRoomButton')}
            </button>
          </>
        )}

        {joined && (
          <p className="lobby-waiting__text">{t('rooms.connectedStarting')}</p>
        )}

        <button className="lobby-btn lobby-btn--back" onClick={handleBack}>
          {t('rooms.back')}
        </button>
      </div>
    </div>
  );
}
