import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import "../components/board/Board.css";
import "./Game.css";
import { Difficulty } from "../../gameOptions/Difficulty";
import { Strategy } from "../../gameOptions/Strategy";

export function Game() {
  const settings = {
    strategy: Strategy.RANDOM,
    difficulty: Difficulty.EASY
  };

  const currentPlayer = "X";
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
          <ControlPanel />
        </div>
      </div>
    </div>
  );
}