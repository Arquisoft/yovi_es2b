import "./End.css";
import type { GameSettings } from "../../gameOptions/GameSettings";

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

export function End({ winner, username, username2 = "", twoPlayers = false, settings, onGoHome, onPlayAgain }: EndProps) {
  const playerWon = winner === username;

  // En 2 jugadores siempre hay un ganador, mostramos quién ganó
  const title = twoPlayers ? "¡Victoria!" : (playerWon ? "¡Victoria!" : "Derrota");
  const icon  = twoPlayers ? "🏆" : (playerWon ? "🏆" : "💀");
  const subtitle = twoPlayers
    ? `¡Enhorabuena, ${winner}, ganaste la partida!`
    : (playerWon ? `¡Enhorabuena, ${username}, ganaste la partida!` : "Has perdido. ¡Intentalo de nuevo!");

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
            <dt>Dificultad</dt>
            <dd>{settings.difficulty}</dd>
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
