import "./End.css";
import type { GameSettings } from "../../components/gameOptions/GameSettings";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

// Definimos la interfaz de las props, necesaria para mostrar el resultado de la partida y ofrecer opciones al usuario
interface EndProps {
  winner: string;        // id del ganador tal como lo devuelve el juego
  username: string;      // id del jugador humano (jugador 1)
  username2?: string;    // id del jugador 2 (solo en modo 2 jugadores)
  twoPlayers?: boolean;  // true si es partida de 2 jugadores
  onlineMode?: boolean;  // true en partida online: muestra victoria/derrota desde la perspectiva del jugador local
  showPlayAgain?: boolean; // false oculta el botón "Jugar de nuevo" (ej. modo online)
  settings: GameSettings;
  onGoHome: () => void; // función para volver al menú principal
  onPlayAgain: () => void; // función para iniciar una nueva partida con las mismas configuraciones
}

function getTitle(twoPlayers: boolean, onlineMode: boolean, winner: string, playerWon: boolean, t: (key: string) => string): string {
  if (twoPlayers && !onlineMode) return t("end.whowon").replace("{winner}", winner);
  return playerWon ? t("end.victory") : t("end.defeat");
}

function getSubtitle(twoPlayers: boolean, onlineMode: boolean, winner: string, username: string, playerWon: boolean, t: (key: string) => string): string {
  if (twoPlayers && !onlineMode) return t("end.personalwin").replace("{player}", winner);
  if (playerWon)  return t("end.personalwin").replace("{player}", username);
  return t("end.personalloss");
}

export function End({ winner, username, username2 = "", twoPlayers = false, onlineMode = false, showPlayAgain = true, settings, onGoHome, onPlayAgain }: Readonly<EndProps>) {
  const { t } = useLanguageContext();
  const playerWon = winner === username;
  const title    = getTitle(twoPlayers, onlineMode, winner, playerWon, t);
  const showWin  = (twoPlayers && !onlineMode) || playerWon;
  const icon     = showWin ? "🏆" : "💀";
  const subtitle = getSubtitle(twoPlayers, onlineMode, winner, username, playerWon, t);

  return (
    <div className="end-screen">

      {/* Tarjeta de resultado. Es dinámica, depende de si el jugador ganó o perdió */}
      <div className={`end-card ${showWin ? "end-card-win" : "end-card-lose"}`}>

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
            <dt>{twoPlayers ? t("end.winner") : t("end.player")}</dt>
            <dd>{twoPlayers ? winner : username}</dd>
          </div>
          {twoPlayers && (
            <div className="end-summary-row">
              <dt>{t("end.loser")}</dt>
              <dd>{winner === username ? username2 : username}</dd>
            </div>
          )}
          <div className="end-summary-row">
            <dt>{twoPlayers ? t("end.player2size") : t("end.player1diff")}</dt>
            <dd>{twoPlayers ? ({ EASY: t("end.player2s"), MEDIUM: t("end.player2m"), HARD: t("end.player2l") } as Record<string, string>)[settings.difficulty] : settings.difficulty}</dd>
          </div>
          {!twoPlayers && (
            <div className="end-summary-row">
              <dt>{t("end.player1strat")}</dt>
              <dd>{settings.strategy}</dd>
            </div>
          )}
          {!twoPlayers && (
            <div className="end-summary-row">
              <dt>{t("end.result")}</dt>
              <dd className={playerWon ? "result-win" : "result-lose"}>
                {playerWon ? t("end.win") : t("end.lose")}
              </dd>
            </div>
          )}
        </dl>

        {/* Botones de acción */}
        <div className="end-actions">
          {showPlayAgain && (
            <button className="end-btn end-btn-primary" onClick={onPlayAgain}>
              <span className="end-btn-icon">↺</span>
              {t("end.again")}
            </button>
          )}
          <button className="end-btn end-btn-secondary" onClick={onGoHome}>
            <span className="end-btn-icon">⌂</span>
            {t("end.home")}
          </button>
        </div>
      </div>
    </div>
  );
}
