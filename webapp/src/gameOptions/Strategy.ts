// constante en lugar de enum para evitar problemas de importacion
// Export indica que se pueden usar en otros archivos
// Estrategias
export const Strategy = {
  RANDOM: "RANDOM",
  DEFENSIVE: "DEFENSIVE",
  OFFENSIVE: "OFFENSIVE",
  CENTER_FIRST: "CENTER_FIRST",
  EDGE_FIRST: "EDGE_FIRST"
} as const;

// Tipo para Strategy. Esto asegura que solo se puedan usar los valores definidos en Strategy.
// keyof typeof Strategy crea un tipo que es la unión de las claves del objeto Strategy, es decir, "RANDOM" | "DEFENSIVE" | "OFFENSIVE" | "CENTER_FIRST" | "EDGE_FIRST".
export type StrategyType = keyof typeof Strategy;