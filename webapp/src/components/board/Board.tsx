import { useState, useEffect } from "react";

import { Casilla } from "./Casilla";
import { getBoardSize } from "../../gameOptions/Difficulty";
import type { DifficultyType } from "../../gameOptions/Difficulty";
import "./Board.css";

const GAMEY_URL = import.meta.env.VITE_API_URL_GY ?? 'http://localhost:4000';

type BoardProps = {
  difficulty: DifficultyType;
  gameId: string;
  turno: string;
  gameState: string;
  username:string;
  changeTurno: (turno: string) => void;
  changeGameState: (winner: string) => void;
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


export function Board(props: BoardProps) {

  const [bloq, setBloq] = useState(false);                             //Estado del tablero (Desbloquedo | Bloqueado)
  const [valores, setValores] = useState<Record<string, number>>({});  //Valores de las casillas del tablero
  const [gameOver, setGameOver] = useState(false);                     //Juego finalizado

  const bloquearTablero = () => {setBloq(true);}      //Bloquea el tablero
  const desbloquearTablero = () => {setBloq(false);}  //Desbloquea el tablero

  // let -> variables que pueden cambiar su valor
  let selectedDifficulty: DifficultyType = props.difficulty; // selectedDifficulty -> dificultad seleccionada por el usuario
  
  // const -> variables no cambia su valor
  const BOARDHIGHT = getBoardSize(selectedDifficulty);
  // constante para el tamaño del tablero, a partir de la dificultad seleccionada por el usuario
  const boardClass = `board board-${BOARDHIGHT}`;


  //Usa el set para actualizar los valores
  const actualizarTablero = (layout: string) => {
    // Convierte el layout que devuelve GameY a un mapa { key -> valor }
    setValores(layoutToValores(layout));
  };

/*

########################################################################

          Jimena  -- Metodos a completar

########################################################################

*/

   // Llama al servidor enviandole el movimiento
   //
   //   Promise<any> -> Devuelve un valor cualquiera de forma async
  async function peticionMovimiento(x: number, y: number, z: number, player: number): Promise<any> {

    // POST /v1/games/gameId/move
    // return json
  }

  // Obtiene el estado actual de la partida desde el servidor
  async function peticionEstadoPartida(): Promise<any> {
    // /v1/games/gameId
    // return json

  }

  // Solicita al bot un movimiento
  // Pasarle estado
  async function peticionMovimientoBot(state: unknown): Promise<any> {

    // POST /v1/ybot/choose/random_bot
    // return json

  }

  /*


   /**
   * METODO RECEPTOR QUE GESTIONA TODA LA LOGICA DEL TABLERO
   * 
   * Cuando se realiza un movimiento, ya sea del bot o del usuario, se invoca a este metodo que actualiza el estado
   * del la aplicacion.
   *
   */
  async function realizarMovimiento(x: number, y: number, z: number, player: number): Promise<void> {
    bloquearTablero();
    try {
      const data = await peticionMovimiento(x, y, z, player);
      actualizarTablero(data.state.layout);

      //Si partida finalizada
      if (data.status.kind === 'Finished') {
        const winnerName: string = data.status.winner === 0 ? props.username : "BOT";
        setGameOver(true);
        props.changeTurno(winnerName);
        props.changeGameState(`Ganó: ${winnerName}`);
        desbloquearTablero();
        return;
      }

      //Actualiza siguiente jugador
      const nextPlayer: number = data.status.next_player;
      props.changeTurno(nextPlayer === 0 ? props.username : "BOT");

      if (nextPlayer !== 0) {
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

      if (data.status.kind === 'Ongoing' && data.status.next_player !== 0) {
        const botMove = await peticionMovimientoBot(data.state);  //Si le toca al bot, Pide peticion de movimiento
        await realizarMovimiento(botMove.coords.x, botMove.coords.y, botMove.coords.z, data.status.next_player);  //Realiza el movimiento que acaba de obtener
      }
    }

    cargarEstadoInicial();
  }, [props.gameId]);



  const manejarClick = async (id: string) => {
    if (bloq || gameOver) return;
    const { x, y, z } = keyToCoords(id, BOARDHIGHT);
    /* Posiblemente se necesiten métodos a parte, depende de como se plantee, lo siento iyan
    estado = ejecutaMovimiento -> Señal a game y
    actualizarTablero -> En función del estado nuevo (Pintar casillas)
    comprobación si el juego esta finalizado -> Lo tiene el estado nuevo
    */

    await realizarMovimiento(x, y, z, 0);
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

/**
 * EN PRINCIPIO YA VIENE CALCULADO DEL METODO QUE CREA EL JUEGO EN GAME.TSX
 * 
 *  Declaración primera de esto, para que funcione el guardar datos de la partida
  // inicio del primer turno en caso de ser bot
async function primerTurno() {
    // if(bot)
	  // llama a servicio para obtener movimiento bot
	  // llama a metodoGrande(movimiento bot)
    // else nada
}*/

  /* Se comprueba al crear el juego

  // antes de empezar, comprobar si el primer turno es del bot
  useEffect(() => {
    if (props.turno === "BOT") {
      bloquearTablero();
      primerTurno();
      desbloquearTablero();
    }
  }, [props.turno]);*/

  /*const proximojugador = () => {
    if(props.turno === "BOT") {
      //Si bot
		  //llama a servicio para obtener movimiento bot
		  // manejarClick(movimiento bot)
      //Si jugador 1 o jugador 2
      props.turno=props.username;
      return;
    }

    props.turno = "BOT";
    //Establecer nombre del próximo jugador
}*/