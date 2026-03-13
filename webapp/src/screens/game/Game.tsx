import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import type { GameSettings } from "../../gameOptions/GameSettings";
import "./Game.css";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
}

export function Game({ settings, username }: GameProps) {
  const currentPlayer = username;
  const gameStatus = "Playing";

  return (
    <div className="game-screen">
      <div className="game-panel">

        <div className="game-info">
          <GameInfo
            settings={settings}
            currentPlayer={currentPlayer}
            gameStatus={gameStatus}
          />
        </div>

        <div className="board-main">
          <Board difficulty={settings.difficulty} />
        </div>

        <div className="controls-bottom">
          <ControlPanel username={username} />
        </div>
      </div>
    </div>
  );
}