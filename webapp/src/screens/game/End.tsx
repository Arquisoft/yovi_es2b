import "./End.css";
import type { GameSettings } from "../../components/gameOptions/GameSettings";

// Definimos la interfaz de las props, necesaria para mostrar el resultado de la partida y ofrecer opciones al usuario
interface EndProps {
  winner: string;        // id del ganador tal como lo devuelve el juego
  username: string;      // id del jugador humano (jugador 1)
  username2?: string;    // id del jugador 2 (solo en modo 2 jugadores)
  twoPlayers?: boolean;  // true si es partida de 2 jugadores
  settings: GameSettings;
  onGoHome: () => void; // función para volver al menú principal
  onPlayAgain: () => void; // función para iniciar una nueva partida con las mismas configuraciones
}

function getTitle(twoPlayers: boolean, winner: string, playerWon: boolean): string {
  if (twoPlayers) return `¡Ganó ${winner}!`;
  return playerWon ? "¡Victoria!" : "¡Derrota!";
}

function getSubtitle(twoPlayers: boolean, winner: string, username: string, playerWon: boolean): string {
  if (twoPlayers) return `¡Enhorabuena, ${winner}, ganaste la partida!`;
  if (playerWon)  return `¡Enhorabuena, ${username}, ganaste la partida!`;
  return "Has perdido. ¡Intentalo de nuevo!";
}

export function End({ winner, username, username2 = "", twoPlayers = false, settings, onGoHome, onPlayAgain }: Readonly<EndProps>) {
  const playerWon = winner === username;
  const title    = getTitle(twoPlayers, winner, playerWon);
  const icon     = (twoPlayers || playerWon) ? "🏆" : "💀";
  const subtitle = getSubtitle(twoPlayers, winner, username, playerWon);

  return (
    <div className="end-screen">

      {/* Tarjeta de resultado. Es dinámica, depende de si el jugador ganó o perdió */}
      <div className={`end-card ${(twoPlayers || playerWon) ? "end-card-win" : "end-card-lose"}`}>

        {/* Icono grande */}
        <div className="end-icon">
          {icon}
        </div>

        {/* Título */}
        <h1 className="end-title">{title}</h1>

        {/* Subtítulo contextual */}
        <p className="end-subtitle">{subtitle}</p>

        {/* Divider decorativo */}
        <div className="end-divider" aria-hidden="true" />

        {/* Resumen de la partida */}
        <dl className="end-summary">
          <div className="end-summary-row">
            <dt>{twoPlayers ? "Ganador" : "Jugador"}</dt>
            <dd>{twoPlayers ? winner : username}</dd>
          </div>
          {twoPlayers && (
            <div className="end-summary-row">
              <dt>Perdedor</dt>
              <dd>{winner === username ? username2 : username}</dd>
            </div>
          )}
          <div className="end-summary-row">
            <dt>{twoPlayers ? "Tamaño del tablero" : "Dificultad"}</dt>
            <dd>{twoPlayers ? ({ EASY: "Pequeño", MEDIUM: "Mediano", HARD: "Grande" } as Record<string, string>)[settings.difficulty] : settings.difficulty}</dd>
          </div>
          {!twoPlayers && (
            <div className="end-summary-row">
              <dt>Estrategia</dt>
              <dd>{settings.strategy}</dd>
            </div>
          )}
          {!twoPlayers && (
            <div className="end-summary-row">
              <dt>Resultado</dt>
              <dd className={playerWon ? "result-win" : "result-lose"}>
                {playerWon ? "Victoria" : "Derrota"}
              </dd>
            </div>
          )}
        </dl>

        {/* Botones de acción */}
        <div className="end-actions">
          <button className="end-btn end-btn-primary" onClick={onPlayAgain}>
            <span className="end-btn-icon">↺</span>
            Jugar de nuevo
          </button>
          <button className="end-btn end-btn-secondary" onClick={onGoHome}>
            <span className="end-btn-icon">⌂</span>
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}
