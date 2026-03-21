// Bot basado en Monte Carlo con rollouts heurísticos.
// Responsable: Iyán Iglesias
use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_casilla};

const SIMULATIONS_PER_MOVE: u32 = 100;

pub struct MonteCarloEndurecidoBot;

impl YBot for MonteCarloEndurecidoBot {
    fn name(&self) -> &str {
        "montecarlo_endurecido_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

        //Sin casillas libres
        if available.is_empty() {
            return None;
        }

        //Movimiento ganador inmediato
        if let Some(coords) = busca_ganador(board, player, &available) {
            return Some(coords);
        }

        let mut rng = rand::rng();
        let mut wins = vec![0u32; available.len()];

        for i in 0..available.len() {
            let coords = Coordinates::from_index(available[i], board.board_size());
            wins[i] = simula_casilla(board, player, coords, SIMULATIONS_PER_MOVE, &mut rng, simula_partida_heuristica);
        }

        return Some(Coordinates::from_index(available[mejor_casilla(&wins)], board.board_size()));
    }
}

// Simula una partida completa con rollouts heuristicos (no aleatorios puros).
fn simula_partida_heuristica<R: rand::Rng>(mut board: GameY, rng: &mut R) -> Option<PlayerId> {
    while !board.check_game_over() {
        let available = board.available_cells().clone();
        if available.is_empty() {
            break;
        }
        let player = board.next_player()?;
        let cell = calcula_heuristico(available, &board, rng);
        let coords = Coordinates::from_index(cell, board.board_size());
        let _resultado = board.add_move(Movement::Placement { player, coords });
    }
    return match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    };
}

// Elige una casilla usando heuristica con algo de aleatoriedad.
// 20% del tiempo elige al azar, el resto puntua y elige entre las 3 mejores.
// Puntuacion = (proximidad_al_centro * 2) + lados_tocados
//
// En el juego Y el centro es estrategicamente clave porque desde ahi
// se puede conectar con los 3 lados. Las casillas de borde solo conectan
// con 1 lado, por lo que la proximidad al centro tiene mas peso.
fn calcula_heuristico<R: rand::Rng>(available: Vec<u32>, board: &GameY, rng: &mut R) -> u32 {
    if rng.random::<f64>() < 0.2 {
        return *available.choose(rng).unwrap();
    }

    let size = board.board_size();
    let center = size / 2;
    let ci = center as i32;

    let mut scored: Vec<(u32, i32)> = available.iter().map(|&cell| {
        let c = Coordinates::from_index(cell, size);
        let dist = (c.x() as i32 - ci).abs()
            + (c.y() as i32 - ci).abs()
            + (c.z() as i32 - ci).abs();
        let sides = c.touches_side_a() as i32
            + c.touches_side_b() as i32
            + c.touches_side_c() as i32;
        (cell, (size as i32 - dist) * 2 + sides)
    }).collect();

    // Ordenamos de mayor a menor puntuacion
    for i in 0..scored.len() {
        for j in i + 1..scored.len() {
            if scored[j].1 > scored[i].1 {
                scored.swap(i, j);
            }
        }
    }

    let top_n = scored.len().min(3).max(1);
    return scored[rng.random_range(0..top_n)].0;
}