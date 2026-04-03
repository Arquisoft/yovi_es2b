import type { StrategyType } from "./Strategy";
import type { DifficultyType } from "./Difficulty";
//import type porque necesitamos los tipos, no las implementaciones.

//GameSettings es la interfaz que define la configuración del juego, incluyendo la estrategia y la dificultad. Se exporta para que pueda ser utilizada en otros archivos, como Home.tsx para el menú de configuración.
//Se elige una interfaz en lugar de una clase porque solo necesitamos definir la forma de los datos, no implementación.
export interface GameSettings {
  strategy: StrategyType;
  difficulty: DifficultyType;
}