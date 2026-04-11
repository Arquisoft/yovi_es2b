// Niveles de dificultad
export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD"
} as const;

// Tipo para Difficulty. Esto asegura que solo se puedan usar los valores definidos en Difficulty.
// keyof typeof Difficulty crea un tipo que es la unión de las claves del objeto Difficulty, es decir, "EASY" | "MEDIUM" | "HARD".
export type DifficultyType = keyof typeof Difficulty;


// Función para obtener el tamaño del tablero según la dificultad
//  difficulty: DifficultyType es el tipo de dificultad, que solo puede ser "EASY", "MEDIUM" o "HARD".
export function getBoardSize(difficulty: DifficultyType) {
  switch (difficulty) {
    case "MEDIUM":
      return 10;
    case "HARD":
      return 12;
    default:
      return 8;
  }
}