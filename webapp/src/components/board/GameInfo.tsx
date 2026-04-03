import type { GameSettings } from "../../gameOptions/GameSettings";
import "./Board.css";

interface Props {
  settings: GameSettings;
  currentPlayer: string; //cambaiar al nombre del jugador cuando este hecho el inicio de sesion
  gameStatus: string;
}

export default function GameInfo(props: Props) {
  return (
    <div className="game-info">
      <h2>Información de partida</h2>
      <div className="info-section">
        <p><strong>Jugador: </strong> {props.currentPlayer}</p>
        {/*cambiar al nombre del jugador cuando este hecho el inicio de sesion*/}
        <p><strong>Oponente: </strong> BOT</p>
      </div>
      <div className="info-section">
        <p><strong>Estrategia: </strong> {props.settings.strategy}</p>
        <p><strong>Dificultad: </strong> {props.settings.difficulty}</p>
      </div>
      <div className="info-section">
        <p><strong>Turno actual: </strong> {props.currentPlayer}</p>
        <p><strong>Estado: </strong> {props.gameStatus}</p>
      </div>
    </div>
  );
}