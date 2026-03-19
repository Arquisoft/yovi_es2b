// Bot basado en Monte Carlo con rollouts heurísticos.
// Responsable: Iyán Iglesias
use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

// Numero de simulaciones por casilla candidata
const SIMULATIONS_PER_MOVE: u32 = 50;

pub struct MonteCarloEndurecidoBot;

impl YBot for MonteCarloEndurecidoBot {
    fn name(&self) -> &str {
        "montecarlo_endurecido_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

        // Si no hay casillas libres retorna
        if available.is_empty() {
            return None;
        }

        // Objeto para numeros aleatorios
        let mut rng = rand::rng();

        // Vector que guarda las partidas ganadas para cada casilla
        let mut wins = vec![0u32; available.len()];

        // Calcula las estadisticas de cada casilla
        for i in 0..available.len() {
            let coords = Coordinates::from_index(available[i], board.board_size());
            
            //Hace simulaciones de las partidas para ver el ratio de victorias
            for _simulacion in 0..SIMULATIONS_PER_MOVE {
                let mut sim_board = board.clone();

                if sim_board
                    .add_move(Movement::Placement { player, coords })
                    .is_err()
                {
                    break;
                }

                if simulaPartida(sim_board, &mut rng) == Some(player) {
                    wins[i] += 1;
                }
            }
        }

        // Elegimos la casilla con mas victorias
        let mut best_idx = 0;
        for i in 0..wins.len() {
            if wins[i] > wins[best_idx] {
                best_idx = i;
            }
        }

        return Some(Coordinates::from_index(available[best_idx], board.board_size()));
    }
}

// Simula una partida completa desde el estado actual hasta el final.
// Devuelve el jugador ganador o None si no hay ganador.
fn simulaPartida(mut board: GameY, rng: &mut impl rand::Rng) -> Option<PlayerId> {
    while !board.check_game_over() {
        let available = board.available_cells().clone();

        if available.is_empty() {
            break;
        }

        let player = board.next_player()?;
        // Mirar casilla con mejor puntuacion
        let cell = calculaHeuristico(available, &board, rng);
        let coords = Coordinates::from_index(cell, board.board_size());

        let _resultado = board.add_move(Movement::Placement { player, coords });
    }

    return match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    };
}

// Elige una casilla usando heuristica con algo de aleatoriedad.
// 30% del tiempo elige al azar, el resto puntua y elige entre las 3 mejores.
// Puntuacion = (lados_tocados * 4) - distancia_al_centro
fn calculaHeuristico(available: Vec<u32>, board: &GameY, rng: &mut impl rand::Rng) -> u32 {
    // Aleatoriedad pura para diversificar los rollouts
    if rng.random::<f64>() < 0.3 {
        return *available.choose(rng).unwrap();
    }

    let size = board.board_size();
    let center = size / 2;

    // Calculamos la puntuacion heuristica de cada casilla
    // Puntuacion = (lados_tocados * 4) - distancia_al_centro
    let mut scored: Vec<(u32, i32)> = Vec::new();
    for i in 0..available.len() {
        let c = Coordinates::from_index(available[i], size);

        // Puntuacion de lados tocados
        let sides = c.touches_side_a() as i32
            + c.touches_side_b() as i32
            + c.touches_side_c() as i32;

        // Puntuacion de distacia al centro
        let ci = center as i32;
        let dist = (c.x() as i32 - ci).abs()
            + (c.y() as i32 - ci).abs()
            + (c.z() as i32 - ci).abs();

        scored.push((available[i], sides * 4 - dist));
    }

    // Ordenamos de mayor a menor puntuacion
    for i in 0..scored.len() {
        for j in i+1..scored.len() {
            if scored[j].1 > scored[i].1 {
                scored.swap(i, j);
            }
        }
    }

    // Elegimos al azar entre los 3 mejores para mantener variabilidad
    let top_n = scored.len().min(3).max(1);
    let pick = rng.random_range(0..top_n);
    //Devuelve una de las casillas con mejor heuristico
    return scored[pick].0;
}
