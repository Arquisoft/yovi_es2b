import { useState, useEffect } from "react";

import { Casilla } from "./Casilla";
import { getBoardSize } from "../../gameOptions/Difficulty";
import type { DifficultyType } from "../../gameOptions/Difficulty";
import "./Board.css";

type BoardProps = {
  difficulty: DifficultyType;
  turno: string;
  gameState: string;
  username:string;
};

/**
 * Declaración primera de esto, para que funcione el guardar datos de la partida
 */ // inicio del primer turno en caso de ser bot
async function primerTurno() {
    // if(bot)
	  // llama a servicio para obtener movimiento bot
	  // llama a metodoGrande(movimiento bot)
    // else nada
}

export function Board(props: BoardProps) {

  const [bloq, setBloq] = useState(false);

  const bloquearTablero = () => {setBloq(true);}
  const desbloquearTablero = () => {setBloq(false);}

  let selectedDifficulty: DifficultyType = props.difficulty;
  // let es para variables que pueden cambiar su valor
  // selectedDifficulty puede cambiar su valor dependiendo de lo que el usuario elija

  // const es para variables que no van a cambiar su valor
  const BOARDHIGHT = getBoardSize(selectedDifficulty);
  // constante para el tamaño del tablero, a partir de la dificultad seleccionada por el usuario
  
  const boardClass = `board board-${BOARDHIGHT}`;

  // Función simple para manejar el click (por ahora solo un log)
  // manejarClick recibe un id de casilla y lo muestra en consola
  const manejarClick = (id: string) => {
    bloquearTablero()
    /* Posiblemente se necesiten métodos a parte, depende de como se plantee, lo siento iyan
    estado = ejecutaMovimiento -> Señal a game y
    actualizarTablero -> En función del estado nuevo (Pintar casillas)
    comprobación si el juego esta finalizado -> Lo tiene el estado nuevo
    */
    proximojugador();
    console.log("Click en: " + id);
  };

  const proximojugador = () => {
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
}

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
            valor={0} //para empezar, todas las casillas están vacías (valor 0)
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

  // antes de empezar, comprobar si el primer turno es del bot
  useEffect(() => {
    if (props.turno === "BOT") {
      bloquearTablero();
      primerTurno();
      desbloquearTablero();
    }
  }, [props.turno]);

  return (
    <div className="board-wrapper">
      <div className={boardClass}>
        {crearTablero()}
      </div>
    </div>
  );
}