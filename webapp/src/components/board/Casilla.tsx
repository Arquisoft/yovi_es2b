

/**
 * Interfaz que define las propiedades de una casilla del tablero.
 * index: Identificador único de la casilla (ej: "0-0" para fila 0, columna 0).
 * valor: Indica el estado de la casilla (0: vacío, 1: Jugador H, 2: Jugador M).
 * alHacerClick: Función que se ejecuta cuando se hace clic en la casilla.
 * Esta interfaz se utiliza para tipar las propiedades que recibe el componente Casilla.
 * Se exporta para que pueda ser utilizada en otros archivos
 **/
interface CasillaProps {
    index: string;          
    valor: number;           
    bloq: boolean;
    alHacerClick: () => void; 
}

/**esta funcion representa cada una de las casillas del tablero,
* se le pasara un index para mostrarlo en la casilla y asi poder identificarla. 
* Se exporta para que pueda ser utilizada en otros archivos, como Board.tsx 
**/
export function Casilla({ index, valor, bloq, alHacerClick }: CasillaProps) {

    return (
        <button 
            className={`cell player-${valor}`}
            onClick={alHacerClick}
            title={`Casilla ${index}`}
            disabled={bloq}
        >
            {/* Ocultamos el index en el juego final, o lo dejamos pequeño para debug */}
            <span className="cell-label">{index}</span>
        </button>
    );
}