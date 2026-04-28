import { useState, useEffect, useRef } from "react";

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

// Convierte una clave de casilla (e.g. "f2-c1") a coordenadas x,y,z.
function keyToCoords(key: string, boardSize: number): { x: number; y: number; z: number } {
  const match = /f(\d+)-c(\d+)/.exec(key); // Extrae fila y columna de la clave
  if (!match) throw new Error(`Clave de casilla inválida: ${key}`); // Debería ser del formato "f{fila}-c{columna}"
  const fila = parseInt(match[1]); 
  const col  = parseInt(match[2]);
  return { x: boardSize - 1 - fila, y: col, z: fila - col }; // Convierte la fila a coordenada x (invirtiendo el orden), la columna a y, y calcula z como fila - columna
}

// Convierte el layout de GameY (string con filas separadas por '/') a un objeto de valores para las casillas.
function layoutToValores(layout: string): Record<string, number> {
  const valores: Record<string, number> = {}; 
  layout.split('/').forEach((fila, filaIdx) => { // Itera sobre cada fila del layout  
    fila.split('').forEach((celda, colIdx) => { // Itera sobre cada celda de la fila
      const key = `f${filaIdx}-c${colIdx}`; // Construye la clave de la casilla correspondiente a esta posición
      if      (celda === 'B') valores[key] = 1; // 'B' representa al jugador 1 (azul)
      else if (celda === 'R') valores[key] = 2; // 'R' representa al jugador 2 (rojo)
      else                    valores[key] = 0; // '-' representa una casilla vacía, o cualquier otro carácter no reconocido también se considera vacía
    });
  });
  return valores; // Devuelve el objeto con las claves de casilla y sus valores correspondientes
}

// Notifica al backend que el jugador ha ganado una partida contra el bot, para actualizar su puntuación.
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

/**
 * Función principal del componente Board, que representa el tablero de juego 
 * Maneja interacción con el backend (GameY) para realizar movimientos, actualizar el estado del tablero y gestionar el turno de los jugadores.
 */
export function Board(props: BoardProps) {

  const [bloq, setBloq] = useState(false); // Indica si el tablero está bloqueado para evitar movimientos durante la espera de respuesta del servidor
  const bloqRef = useRef(false); // Ref síncrona para evitar doble clic antes de que React re-renderice
  const [valores, setValores] = useState<Record<string, number>>({}); // Almacena el estado actual del tablero
  const [gameOver, setGameOver] = useState(false); // Indica si la partida ha terminado, para evitar más movimientos y mostrar el ganador

  const bloquearTablero   = () => { bloqRef.current = true;  setBloq(true);  };
  const desbloquearTablero = () => { bloqRef.current = false; setBloq(false); };

  const selectedDifficulty: DifficultyType = props.difficulty; // Dificultad seleccionada por el jugador, que determina el tamaño del tablero 
  const selectedStrategy: StrategyType    = props.strategy; // Estrategia seleccionada por el jugador para el bot, que determina cómo el bot elegirá sus movimientos

  const BOARDHIGHT = getBoardSize(selectedDifficulty); // Obtiene el tamaño del tablero según la dificultad seleccionada
  const boardClass = `board board-${BOARDHIGHT}`; // Clase CSS para el tablero, que puede variar según el tamaño 

  /**
   * Función para actualizar el estado del tablero a partir del layout recibido del backend (GameY) después de un movimiento.
   * Convierte el layout (string) a un objeto de valores para las casillas y lo guarda en el estado.
   */
  const actualizarTablero = (layout: string) => setValores(layoutToValores(layout)); 

  /**
   * Resuelve el nombre del jugador a partir de su índice en GameY (0 o 1).
   * En modo online el mapeo depende de localPlayerIndex porque username
   * es siempre el jugador local, no necesariamente el jugador 0 de GameY.
   */
  function getPlayerName(playerIndex: number): string {
    if (props.onlineMode) { // En modo online, el jugador local puede ser el jugador 0 o el jugador 1 en GameY, dependiendo de localPlayerIndex
      return playerIndex === props.localPlayerIndex ? props.username : props.username2;
    }
    if (playerIndex === 0) return props.username; // En modo offline, el jugador 0 es siempre username y el jugador 1 es username2 o BOT
    return props.twoPlayers ? props.username2 : "BOT";
  }

  /**
   * Función para realizar un movimiento en el backend (GameY) enviando las coordenadas x,y,z y el jugador que realiza el movimiento.
   * Devuelve la respuesta del servidor con el nuevo estado de la partida después de realizar el movimiento.
   */
  async function peticionMovimiento(x: number, y: number, z: number, player: number): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, x, y, z }),
    });
    if (!res.ok) throw new Error("Movimiento rechazado por el servidor");
    return res.json();
  }

  /**
   * Función para obtener el estado actual de la partida desde el backend (GameY), 
   */
  async function peticionEstadoPartida(): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}`); 
    if (!res.ok) throw new Error("Error al obtener el estado de la partida");
    return res.json();
  }

  /**
   * Función para obtener la estrategia del bot en formato que el backend (GameY) espera, a partir de la estrategia seleccionada por el jugador.
   */
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

  /**
   * Función para solicitar al backend (GameY) el movimiento del bot
   */
  async function peticionMovimientoBot(state: unknown): Promise<any> {
    const params = new URLSearchParams({
      position: JSON.stringify(state),
      bot_id: strategyToBotId(selectedStrategy),
    });
    const res = await fetch(`${GAMEY_URL}/play?${params}`);
    if (!res.ok) throw new Error("Error al obtener movimiento del bot");
    return res.json();
  }

  /**
   * Funcion para ejecutar una acción del bot (en el backend (GameY) enviando el jugador y la acción a realizar.
   */
  async function peticionAccionBot(player: number, action: string): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, action }),
    });
    if (!res.ok) throw new Error(`Error al ejecutar acción del bot: ${action}`);
    return res.json();
  }

  /**
   * Funcion  para realizar un movimiento, que se llama tanto al hacer click en una casilla como al ejecutar el movimiento del bot.
   */
  async function realizarMovimiento(x: number, y: number, z: number, player: number): Promise<void> {
    bloquearTablero(); // Bloquea el tablero para evitar que el jugador realice otro movimiento mientras se procesa este
    try {
      const data = await peticionMovimiento(x, y, z, player); // Envía el movimiento al backend (GameY) y espera la respuesta con el nuevo estado de la partida
      actualizarTablero(data.state.layout); // Actualiza el estado del tablero con el layout recibido del backend

      // Si la partida ha terminado, muestra el ganador y notifica al componente padre
      if (data.status.kind === 'Finished') { 
        const winnerName = getPlayerName(data.status.winner);
        setGameOver(true);
        props.changeTurno(winnerName);
        props.onGameEnd(winnerName);
        desbloquearTablero(); // Desbloquea el tablero para permitir que se muestre el estado final, aunque no se puedan hacer más movimientos
        if (data.status.winner === 0 && !props.twoPlayers) { 
          partidaGanada(props.username, props.strategy, props.difficulty); 
        }
        return;
      }
       // Si la partida continúa, cambia el turno al siguiente jugador. En modo offline, si el siguiente jugador es el bot, solicita su movimiento automáticamente.
      const nextPlayer: number = data.status.next_player;
      props.changeTurno(getPlayerName(nextPlayer));

      if (!props.twoPlayers && nextPlayer !== 0) { // Si es el turno del bot en una partida contra el bot, solicita su movimiento automáticamente
        const botMove = await peticionMovimientoBot(data.state);
        if (botMove.action) { // Si el bot devuelve una acción (en lugar de coordenadas), ejecuta esa acción
          const actionData = await peticionAccionBot(nextPlayer, botMove.action); // Envía la acción del bot al backend (GameY) y espera la respuesta con el nuevo estado de la partida
          actualizarTablero(actionData.state.layout);
          if (actionData.status.kind === 'Finished') { // Si la partida ha terminado después de la acción del bot, muestra el ganador y notifica al componente padre
            const winnerName = getPlayerName(actionData.status.winner);
            setGameOver(true);
            props.changeTurno(winnerName);
            props.onGameEnd(winnerName);
          } else {
            props.changeTurno(getPlayerName(actionData.status.next_player));
          }
          desbloquearTablero(); 
        } else { //Caso de que el bot devuelva coordenadas directamente, realiza el movimiento con esas coordenadas
          await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, nextPlayer);
          desbloquearTablero(); 
        }
      } else { //Caso de partida online o partida offline entre dos jugadores humanos, simplemente desbloquea el tablero para permitir que el siguiente jugador realice su movimiento
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
            desbloquearTablero();
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
    if (bloqRef.current || gameOver) return;
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
