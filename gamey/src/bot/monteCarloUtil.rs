use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId};
use rand::prelude::IndexedRandom;

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

// Simula una partida completa con movimientos aleatorios y devuelve el jugador ganador.
pub fn simula_partida<R: rand::Rng>(mut board: GameY, rng: &mut R) -> Option<PlayerId> {
    while !board.check_game_over() {
        let available = board.available_cells().clone();
        if available.is_empty() {
            break;
        }
        let player = board.next_player()?;
        let cell = available.choose(rng)?;
        let coords = Coordinates::from_index(*cell, board.board_size());
        let _resultado = board.add_move(Movement::Placement { player, coords });
    }
    return match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    };
}