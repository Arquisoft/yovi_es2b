use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId};
use rand::prelude::IndexedRandom;
use rand::Rng;

// Comprueba si hay un movimiento ganador inmediato y lo devuelve.
pub fn busca_ganador(board: &GameY, player: PlayerId, available: &[u32]) -> Option<Coordinates> {
    for &cell in available {
        let coords = Coordinates::from_index(cell, board.board_size());
        let mut sim = board.clone();
        if sim.add_move(Movement::Placement { player, coords }).is_ok() && sim.check_game_over() {
            return Some(coords);
        }
    }
    return None;
}

// Devuelve el indice con el mayor valor en el slice.
pub fn mejor_casilla(scores: &[u32]) -> usize {
    let mut best = 0;
    for i in 0..scores.len() {
        if scores[i] > scores[best] {
            best = i;
        }
    }
    return best;
}

// Ejecuta n_sims simulaciones para una casilla usando la funcion de rollout dada.
// Devuelve el numero de victorias del jugador.
pub fn simula_casilla<R, F>(
    board: &GameY,
    player: PlayerId,
    coords: Coordinates,
    n_sims: u32,
    rng: &mut R,
    rollout: F,
) -> u32
where
    R: rand::Rng,
    F: Fn(GameY, &mut R) -> Option<PlayerId>,
{
    let mut wins = 0u32;
    for _ in 0..n_sims {
        let mut sim_board = board.clone();
        if sim_board.add_move(Movement::Placement { player, coords }).is_err() {
            break;
        }
        if rollout(sim_board, rng) == Some(player) {
            wins += 1;
        }
    }
    return wins;
}

// Simula una partida completa con rollouts heuristicos y devuelve el jugador ganador.
pub fn simula_partida<R: rand::Rng>(mut board: GameY, rng: &mut R) -> Option<PlayerId> {
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
        return (cell, (size as i32 - dist) * 2 + sides);
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