import { useEffect, useState } from "react";

import { Board } from "../../components/board/Board";
import GameInfo from "../../components/board/GameInfo";
import ControlPanel from "../../components/board/ControlPanel";
import type { GameSettings } from "../../gameOptions/GameSettings";
import "./Game.css";

// Definimos la interfaz de las props
interface GameProps {
  settings: GameSettings;
  username: string;
  stateStart: boolean;
}

/**
 * Declaración primera de esto, para que funcione el guardar datos de la partida
 */
async function crearPartida() {
    // completar con el post de crearJuego
}

async function getTurnoPartida() {
    // completar con el post de preguntamosEstado -> TURNO
    return "Turno";
}

async function getEstadoPartida() {
    // completar con el post de preguntamosEstado -> PROCESO DE JUGAR
    return "Jugando";
}

export function Game({ settings, username, stateStart }: GameProps) {
  // en caso de necesitar mas atributos, crear cosas aquí y async functions que ayuden a esto
  const [turno, setTurno] = useState("Inicio");
  const [gameState, setGameState] = useState("Inicio");

  // como es función async, llamamos useEffect
  useEffect(() => {
    async function nuevaPartida() {
      if (stateStart) {
        await crearPartida();

        // para cada atributo
        setTurno(await getTurnoPartida());
        setGameState(await getEstadoPartida());

      }
    }
    nuevaPartida();
  }, [stateStart]);

  return (
    <div className="game-screen">
      <div className="game-panel">

        <div className="game-info">
          <GameInfo
            settings={settings}
            currentPlayer={turno}
            gameStatus={gameState}
          />
        </div>

        <div className="board-main">
          <Board difficulty={settings.difficulty} turno={turno} gameState={gameState} username={username}/>
        </div>

        <div className="controls-bottom">
          <ControlPanel username={username} />
        </div>
      </div>
    </div>
  );
}