import "./End.css";
import type { GameSettings } from "../../gameOptions/GameSettings";

// Definimos la interfaz de las props, necesaria para mostrar el resultado de la partida y ofrecer opciones al usuario
interface EndProps {
  winner: string;        // id del ganador tal como lo devuelve el juego
  username: string;      // id del jugador humano
  settings: GameSettings;
  onGoHome: () => void; // función para volver al menú principal
  onPlayAgain: () => void; // función para iniciar una nueva partida con las mismas configuraciones
}

export function End({ winner, username, settings, onGoHome, onPlayAgain }: EndProps) {
  const playerWon = winner === username;

  return (
    <div className="end-screen">
      {}
      <div className="end-bg" >
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="end-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <div className={`end-card ${playerWon ? "end-card--win" : "end-card--lose"}`}>

        {/* Icono grande */}
        <div className="end-icon" >
          {playerWon ? "🏆" : "💀"}
        </div>

        {/* Título */}
        <h1 className="end-title">
          {playerWon ? "¡Victoria!" : "Derrota"}
        </h1>

        {/* Subtítulo contextual */}
        <p className="end-subtitle">
          {playerWon
            ? `¡Enhorabuena, ${username}, ganaste la partida!.`
            : `Has perdido. ¡Intentalo de nuevo!`}
        </p>

        {/* Divider decorativo */}
        <div className="end-divider" aria-hidden="true" />

        {/* Resumen de la partida */}
        <dl className="end-summary">
          <div className="end-summary-row">
            <dt>Jugador</dt>
            <dd>{username}</dd>
          </div>
          <div className="end-summary-row">
            <dt>Dificultad</dt>
            <dd>{settings.difficulty}</dd>
          </div>
          <div className="end-summary-row">
            <dt>Estrategia</dt>
            <dd>{settings.strategy}</dd>
          </div>
          <div className="end-summary-row">
            <dt>Resultado</dt>
            <dd className={playerWon ? "result--win" : "result--lose"}>
              {playerWon ? "Victoria" : "Derrota"}
            </dd>
          </div>
        </dl>

        {/* Botones de acción */}
        <div className="end-actions">
          <button className="end-btn end-btn--primary" onClick={onPlayAgain}>
            <span className="end-btn-icon">↺</span>
            Jugar de nuevo
          </button>
          <button className="end-btn end-btn--secondary" onClick={onGoHome}>
            <span className="end-btn-icon">⌂</span>
            Volver al menú
          </button>
        </div>

      </div>
    </div>
  );
}
