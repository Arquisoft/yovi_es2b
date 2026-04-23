import { useState, useEffect } from "react";

import { Casilla } from "./Casilla";
import { getBoardSize } from "../gameOptions/Difficulty";
import type { DifficultyType } from "../gameOptions/Difficulty";
import "./Board.css";
import type { StrategyType } from "../gameOptions/Strategy";

const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';

type BoardProps = {
  strategy: StrategyType;
  difficulty: DifficultyType;
  gameId: string;
  turno: string;
  gameState: string;
  username: string;
  username2: string;
  twoPlayers: boolean;
  refreshKey: number;
  hintCoords?: { x: number; y: number; z: number } | null;
  changeTurno: (turno: string) => void;
  onGameEnd: (winner: string) => void;
  // Modo online
  onlineMode?: boolean;
  localPlayerIndex?: number;
  onOnlineMove?: (x: number, y: number, z: number, player: number) => void;
};

function keyToCoords(key: string, boardSize: number): { x: number; y: number; z: number } {
  const match = key.match(/f(\d+)-c(\d+)/);
  if (!match) throw new Error(`Clave de casilla inválida: ${key}`);
  const fila = parseInt(match[1]);
  const col  = parseInt(match[2]);
  return { x: boardSize - 1 - fila, y: col, z: fila - col };
}

function layoutToValores(layout: string): Record<string, number> {
  const valores: Record<string, number> = {};
  layout.split('/').forEach((fila, filaIdx) => {
    fila.split('').forEach((celda, colIdx) => {
      const key = `f${filaIdx}-c${colIdx}`;
      if      (celda === 'B') valores[key] = 1;
      else if (celda === 'R') valores[key] = 2;
      else                    valores[key] = 0;
    });
  });
  return valores;
}

async function partidaGanada(username: string, strategy: string, difficulty: string) {
  try {
    const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
    const res = await fetch(`${API_URL}/endmatch`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, strategy, difficulty })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Network error', { cause: err });
  }
}


export function Board(props: BoardProps) {

  const [bloq, setBloq] = useState(false);
  const [valores, setValores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);

  const bloquearTablero   = () => setBloq(true);
  const desbloquearTablero = () => setBloq(false);

  const selectedDifficulty: DifficultyType = props.difficulty;
  const selectedStrategy: StrategyType    = props.strategy;

  const BOARDHIGHT = getBoardSize(selectedDifficulty);
  const boardClass = `board board-${BOARDHIGHT}`;

  const actualizarTablero = (layout: string) => setValores(layoutToValores(layout));

  /**
   * Resuelve el nombre del jugador a partir de su índice en GameY (0 o 1).
   * En modo online el mapeo depende de localPlayerIndex porque username
   * es siempre el jugador local, no necesariamente el jugador 0 de GameY.
   */
  function getPlayerName(playerIndex: number): string {
    if (props.onlineMode) {
      return playerIndex === props.localPlayerIndex ? props.username : props.username2;
    }
    if (playerIndex === 0) return props.username;
    return props.twoPlayers ? props.username2 : "BOT";
  }

  async function peticionMovimiento(x: number, y: number, z: number, player: number): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, x, y, z }),
    });
    if (!res.ok) throw new Error("Movimiento rechazado por el servidor");
    return res.json();
  }

  async function peticionEstadoPartida(): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}`);
    if (!res.ok) throw new Error("Error al obtener el estado de la partida");
    return res.json();
  }

  function strategyToBotId(strategy: StrategyType): string {
    const map: Record<StrategyType, string> = {
      RANDOM: "random_bot",
      DEFENSIVO: "defensive_bot",
      OFENSIVO: "offensive_bot",
      MONTE_CARLO: "montecarlo_bot",
      MONTE_CARLO_MEJORADO: "montecarlo_mejorado_bot",
      MONTE_CARLO_ENDURECIDO: "montecarlo_endurecido_bot",
      MONTE_CARLO_ENDURECIDO_CONCURSO: "montecarlo_endurecido_concurso_bot",
    };
    return map[strategy];
  }

  async function peticionMovimientoBot(state: unknown): Promise<any> {
    const params = new URLSearchParams({
      position: JSON.stringify(state),
      bot_id: strategyToBotId(selectedStrategy),
    });
    const res = await fetch(`${GAMEY_URL}/play?${params}`);
    if (!res.ok) throw new Error("Error al obtener movimiento del bot");
    return res.json();
  }

  async function peticionAccionBot(player: number, action: string): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, action }),
    });
    if (!res.ok) throw new Error(`Error al ejecutar acción del bot: ${action}`);
    return res.json();
  }

  async function realizarMovimiento(x: number, y: number, z: number, player: number): Promise<void> {
    bloquearTablero();
    try {
      const data = await peticionMovimiento(x, y, z, player);
      actualizarTablero(data.state.layout);

      if (data.status.kind === 'Finished') {
        const winnerName = getPlayerName(data.status.winner);
        setGameOver(true);
        props.changeTurno(winnerName);
        props.onGameEnd(winnerName);
        desbloquearTablero();
        if (data.status.winner === 0 && !props.twoPlayers) {
          partidaGanada(props.username, props.strategy, props.difficulty);
        }
        return;
      }

      const nextPlayer: number = data.status.next_player;
      props.changeTurno(getPlayerName(nextPlayer));

      if (!props.twoPlayers && nextPlayer !== 0) {
        const botMove = await peticionMovimientoBot(data.state);
        if (botMove.action) {
          const actionData = await peticionAccionBot(nextPlayer, botMove.action);
          actualizarTablero(actionData.state.layout);
          if (actionData.status.kind === 'Finished') {
            const winnerName = getPlayerName(actionData.status.winner);
            setGameOver(true);
            props.changeTurno(winnerName);
            props.onGameEnd(winnerName);
          } else {
            props.changeTurno(getPlayerName(actionData.status.next_player));
          }
          desbloquearTablero();
        } else {
          await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, nextPlayer);
        }
      } else {
        desbloquearTablero();
      }
    } catch (err) {
      console.error("Error en realizarMovimiento:", err);
      desbloquearTablero();
    }
  }

  // Carga el estado del tablero desde GameY.
  // En modo online se llama también cuando refreshKey cambia (move-made recibido).
  useEffect(() => {
    if (!props.gameId) return;

    async function cargarEstadoInicial() {
      try {
        const data = await peticionEstadoPartida();
actualizarTablero(data.state.layout);

        if (data.status.kind === 'Ongoing') {
          props.changeTurno(getPlayerName(data.status.next_player));
        }

        // En modo online el tablero se bloqueó al emitir el movimiento; desbloquear aquí
        if (props.onlineMode) {
          desbloquearTablero();
          return;
        }

        if (!props.twoPlayers && data.status.kind === 'Ongoing' && data.status.next_player !== 0) {
          const botMove = await peticionMovimientoBot(data.state);
          if (botMove.action) {
            const actionData = await peticionAccionBot(data.status.next_player, botMove.action);
            actualizarTablero(actionData.state.layout);
            if (actionData.status.kind === 'Ongoing') {
              props.changeTurno(getPlayerName(actionData.status.next_player));
            }
          } else {
            await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, data.status.next_player);
          }
        }
      } catch (err) {
        console.error("Error cargando estado:", err);
        if (props.onlineMode) desbloquearTablero();
      }
    }

    cargarEstadoInicial();
  }, [props.gameId, props.refreshKey]);


  const manejarClick = async (id: string) => {
    if (bloq || gameOver) return;
    const { x, y, z } = keyToCoords(id, BOARDHIGHT);

    if (props.onlineMode) {
      // Solo puede mover el jugador local cuando es su turno
      if (props.turno !== props.username) return;
      bloquearTablero();
      props.onOnlineMove?.(x, y, z, props.localPlayerIndex!);
      return;
    }

    const playerActual = props.twoPlayers && props.turno === props.username2 ? 1 : 0;
    await realizarMovimiento(x, y, z, playerActual);
  };

  const crearTablero = () => {
    const TABLERO = [];
    for (let x = 0; x < BOARDHIGHT; x++) {
      const casillasDeLaFila = [];
      for (let c = 0; c <= x; c++) {
        const key = `f${x}-c${c}`;
        const hintKey = props.hintCoords
          ? `f${BOARDHIGHT - 1 - props.hintCoords.x}-c${props.hintCoords.y}`
          : null;
        casillasDeLaFila.push(
          <Casilla
            key={key}
            index={key}
            valor={valores[key] ?? 0}
            bloq={bloq}
            isHint={key === hintKey}
            alHacerClick={() => manejarClick(key)}
          />
        );
      }
      TABLERO.push(
        <div key={`fila-${x}`} className="row-container">
          {casillasDeLaFila}
        </div>
      );
    }
    return TABLERO;
  };

  return (
    <div className="board-wrapper">
      <div className={boardClass}>
        {crearTablero()}
      </div>
    </div>
  );
}
