// constante en lugar de enum para evitar problemas de importacion
// Export indica que se pueden usar en otros archivos
// Estrategias
export const Strategy = {
  RANDOM: "RANDOM",
  DEFENSIVO: "DEFENSIVO",
  OFENSIVO: "OFENSIVO",
  MONTE_CARLO: "MONTE_CARLO",
  MONTE_CARLO_MEJORADO: "MONTE_CARLO_MEJORADO",
  MONTE_CARLO_ENDURECIDO: "MONTE_CARLO_ENDURECIDO",
  MONTE_CARLO_ENDURECIDO_CONCURSO: "MONTE_CARLO_ENDURECIDO_CONCURSO"
} as const;

// Tipo para Strategy. Esto asegura que solo se puedan usar los valores definidos en Strategy.
// keyof typeof Strategy crea un tipo que es la unión de las claves del objeto Strategy, es decir, "RANDOM" | "DEFENSIVE" | "OFFENSIVE" | "CENTER_FIRST" | "EDGE_FIRST".
export type StrategyType = keyof typeof Strategy;