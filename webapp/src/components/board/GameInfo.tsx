import type { GameSettings } from "../gameOptions/GameSettings";
import "./Board.css";

interface Props {
  settings: GameSettings;
  currentPlayer: string; //cambaiar al nombre del jugador cuando este hecho el inicio de sesion
  gameStatus: string;
  twoPlayers?: boolean;
}

export default function GameInfo(props: Props) {
  return (
    <div className="game-info">
      <h2>Información de partida</h2>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>Jugador: </strong> {props.currentPlayer}</p>}
        {!props.twoPlayers && <p><strong>Oponente: </strong> BOT</p>}
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