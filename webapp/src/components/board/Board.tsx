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
  changeTurno: (turno: string) => void;
  onGameEnd: (winner: string) => void;
};


// Convierte la clave "f{fila}-c{col}" del tablero a coordenadas (x, y, z) con las que trabaja GAME Y
function keyToCoords(key: string, boardSize: number): { x: number; y: number; z: number } {
  const match = key.match(/f(\d+)-c(\d+)/);     // Aplica la expresion regular para sacar fila y columna
  if (!match) throw new Error(`Clave de casilla inválida: ${key}`);  //Error de casilla
  const fila = parseInt(match[1]);
  const col  = parseInt(match[2]);
  return {
    x: boardSize - 1 - fila, // x = boardSize - 1 - fila
    y: col,                  // y = col
    z: fila - col,           // z = fila - col
  };
}

// Recorre el layout YEN ("B/BR/.R.") a un mapa { key -> valor } para facilitar pintar el tablero
function layoutToValores(layout: string): Record<string, number> {
  const valores: Record<string, number> = {};
  layout.split('/').forEach((fila, filaIdx) => {
    fila.split('').forEach((celda, colIdx) => {
      const key = `f${filaIdx}-c${colIdx}`;
      if      (celda === 'B') valores[key] = 1; //Azul
      else if (celda === 'R') valores[key] = 2; //Roja
      else                    valores[key] = 0; //Vacia
    });
  });
  return valores;
}

// método que conecta con la base de datos SI Y SOLO SI SE GANA LA PARTIDA
async function partidaGanada(username: string, strategy: string, difficulty: string) {
  try {
    const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
    const res = await fetch(`${API_URL}/endmatch`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, strategy, difficulty })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server error');
    }
  } catch (err: any) {
    throw new Error(err.message || 'Network error');
  }
}


export function Board(props: BoardProps) {

  const [bloq, setBloq] = useState(false);                             //Estado del tablero (Desbloquedo | Bloqueado)
  const [valores, setValores] = useState<Record<string, number>>({});  //Valores de las casillas del tablero
  const [gameOver, setGameOver] = useState(false);                     //Juego finalizado

  const bloquearTablero = () => {setBloq(true);}      //Bloquea el tablero
  const desbloquearTablero = () => {setBloq(false);}  //Desbloquea el tablero

  // let -> variables que pueden cambiar su valor
  let selectedDifficulty: DifficultyType = props.difficulty; // selectedDifficulty -> dificultad seleccionada por el usuario
  let selectedStrategy: StrategyType = props.strategy; // selectedStrategy -> estrategia seleccionada por el usuario del bot
  
  // const -> variables no cambia su valor
  const BOARDHIGHT = getBoardSize(selectedDifficulty);
  // constante para el tamaño del tablero, a partir de la dificultad seleccionada por el usuario
  const boardClass = `board board-${BOARDHIGHT}`;


  //Usa el set para actualizar los valores
  const actualizarTablero = (layout: string) => {
    // Convierte el layout que devuelve GameY a un mapa { key -> valor }
    setValores(layoutToValores(layout));
  };

   // Llama al servidor enviandole el movimiento (Solo Jugador)
   // Promise<any> -> Devuelve un valor cualquiera de forma async -> json con el estado de tablero actualizado
  async function peticionMovimiento(x: number, y: number, z: number, player: number): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, x, y, z }),
    });

    if (!res.ok) throw new Error("Movimiento rechazado por el servidor");
    return res.json();
  }

  // Llama al servidor para obtener el estado actual de la partida -> json
  async function peticionEstadoPartida(): Promise<any> {
    const res = await fetch(`${GAMEY_URL}/v1/games/${props.gameId}`);
    if (!res.ok) {
      throw new Error("Error al obtener el estado de la partida");
    } 
    return res.json();
  }

  // Si se añade un nuevo bot o se cambia el nombre, hay que cambiarla aqui
  function strategyToBotId(strategy: StrategyType): string {
    const map: Record<StrategyType, string> = {
      RANDOM: "random_bot",
      DEFENSIVO: "defensive_bot",
      OFENSIVO: "offensive_bot",
      MONTE_CARLO: "montecarlo_bot",
      MONTE_CARLO_MEJORADO: "montecarlo_mejorado_bot",
      MONTE_CARLO_ENDURECIDO: "montecarlo_endurecido_bot",
    };
    return map[strategy];
  }

  // Llama al servidor enviandole el movimiento (Solo Bot)
   // Promise<any> -> Devuelve un valor cualquiera de forma async -> json con el estado de tablero actualizado
  async function peticionMovimientoBot(state: unknown): Promise<any> {
    const botId = strategyToBotId(selectedStrategy);
    const res = await fetch(`${GAMEY_URL}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: state, bot_type: botId }),
    });
    if (!res.ok) throw new Error("Error al obtener movimiento del bot");
    return res.json();
  }

   /**
   * METODO RECEPTOR QUE GESTIONA TODA LA LOGICA DEL TABLERO
   * 
   * Cuando se realiza un movimiento, ya sea del bot o del usuario, se invoca a este metodo que actualiza el estado
   * del la aplicacion.
   *
   */
  function getPlayerName(playerIndex: number): string {
    if (playerIndex === 0) return props.username;
    return props.twoPlayers ? props.username2 : "BOT";
  }

  async function realizarMovimiento(x: number, y: number, z: number, player: number): Promise<void> {
    bloquearTablero();
    try {
      const data = await peticionMovimiento(x, y, z, player);
      actualizarTablero(data.state.layout);

      //Si partida finalizada
      if (data.status.kind === 'Finished') {
        const winnerName: string = getPlayerName(data.status.winner);
        setGameOver(true);
        props.changeTurno(winnerName);
        props.onGameEnd(winnerName);
        desbloquearTablero();

        if(data.status.winner === 0 && !props.twoPlayers) {
          partidaGanada(props.username, props.strategy, props.difficulty);
        }

        return;
      }

      //Actualiza siguiente jugador
      const nextPlayer: number = data.status.next_player;
      props.changeTurno(getPlayerName(nextPlayer));

      if (!props.twoPlayers && nextPlayer !== 0) {
        const botMove = await peticionMovimientoBot(data.state);
        await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, nextPlayer);
      } else {
        desbloquearTablero();
      }

    } catch (err) {
      console.error("Error en realizarMovimiento:", err);
      desbloquearTablero();
    }
  };

  // Flujo de ejecucion -> Si le toca el bot, lo hace directamente
  useEffect(() => {
    if (!props.gameId) return; //Si no hay gameID

    async function cargarEstadoInicial() {
      const data = await peticionEstadoPartida(); //Pide el estado y recibe el JSON
      actualizarTablero(data.state.layout);

      if (data.status.kind === 'Ongoing') {
        props.changeTurno(getPlayerName(data.status.next_player));
      }

      if (!props.twoPlayers && data.status.kind === 'Ongoing' && data.status.next_player !== 0) {
        const botMove = await peticionMovimientoBot(data.state);  //Si le toca al bot, Pide peticion de movimiento
        await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, data.status.next_player);  //Realiza el movimiento que acaba de obtener
      }
    }

    cargarEstadoInicial();
  }, [props.gameId, props.refreshKey]);



  const manejarClick = async (id: string) => {
    if (bloq || gameOver) return;
    const { x, y, z } = keyToCoords(id, BOARDHIGHT);
    const playerActual = props.twoPlayers && props.turno === props.username2 ? 1 : 0;
    await realizarMovimiento(x, y, z, playerActual);
  };

  /**
   * Metodo para crear el tablero de juego. 
   * Crea un array de filas, donde cada fila contiene un número creciente de casillas.
   * @returns el tablero como un array
   */
  const crearTablero = () => {
    const TABLERO = []; 
   
    // Bucle 1: Crea las filas (de 0 a BOARDHIGHT - 1)
    for (let x = 0; x < BOARDHIGHT; x++) {
      const casillasDeLaFila = [];

      // Bucle 2: En la fila 'x', siempre hay 'x + 1' casillas
      for (let c = 0; c <= x; c++) {
        // Calculamos un ID único usando las coordenadas
        const key = `f${x}-c${c}`;
        
        // Creamos una casilla con el índice y coordenadas y la añadimos a la fila
       casillasDeLaFila.push(
          <Casilla 
            key={key}
            index={key} 
            valor={valores[key] ?? 0} //Al cambiar valores se cambiara el de la casilla
            bloq={bloq}
            alHacerClick={() => manejarClick(key)} //pasamos la función de click con el ID de la casilla
          />
        );
      }

      // Insertamos la fila completa en el array TABLERO dentro del bucle X
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