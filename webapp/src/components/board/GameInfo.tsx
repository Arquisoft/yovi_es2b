import type { GameSettings } from "../gameOptions/GameSettings";
import "./Board.css";

interface Props {
  settings: GameSettings;
  currentPlayer: string;
  gameStatus: string;
  twoPlayers?: boolean;
  onlineMode?: boolean;
  localUsername?: string;
  localPlayerIndex?: number;
}

export default function GameInfo(props: Props) {
  const playerColor = props.localPlayerIndex === 0 ? '#0c55c0' : '#b91c1c';

  return (
    <div className="game-info">
      <h2>Información de partida</h2>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>Jugador: </strong> {props.currentPlayer}</p>}
        {!props.twoPlayers && <p><strong>Oponente: </strong> BOT</p>}
        {props.onlineMode && props.localUsername !== undefined && (
          <p><strong>Jugador: </strong><span style={{ color: playerColor }}>{props.localUsername}</span></p>
        )}
      </div>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>Estrategia: </strong> {props.settings.strategy}</p>}
        {!props.twoPlayers && <p><strong>Dificultad: </strong> {props.settings.difficulty}</p>}
        {props.twoPlayers && <p><strong>Tamaño del tablero: </strong> {{ EASY: "Pequeño", MEDIUM: "Mediano", HARD: "Grande" }[props.settings.difficulty]}</p>}
      </div>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>Turno actual: </strong> {props.currentPlayer}</p>}
        <p><strong>Estado: </strong> {props.gameStatus}</p>
      </div>
    </div>
  );
}