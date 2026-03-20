// Bot basado en Monte Carlo con rollouts aleatorios.
// Responsable: Iyán Iglesias
use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

// Numero de simulaciones por casilla candidata
const SIMULATIONS_PER_MOVE: u32 = 100;

pub struct MonteCarloBot;

impl YBot for MonteCarloBot {
    fn name(&self) -> &str {
        "montecarlo_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

        // Si no hay casillas libres retorna
        if available.is_empty() {
            return None;
        }

        // Comprueba si hay un movimiento ganador inmediato y lo juega
        for &cell in &available {
            let coords = Coordinates::from_index(cell, board.board_size());
            let mut sim = board.clone();
            if sim.add_move(Movement::Placement { player, coords }).is_ok() && sim.check_game_over() {
                return Some(coords);
            }
        }

        // Objeto para numeros aleatorios
        let mut rng = rand::rng();

        // Vector que guarda las partidas ganadas para cada casilla
        let mut wins = vec![0u32; available.len()];

        // Calcula las estadisticas de cada casilla
        for i in 0..available.len() {
            let coords = Coordinates::from_index(available[i], board.board_size());

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

// Simula una partida completa desde el estado actual hasta el final con movimientos aleatorios.
// Devuelve el jugador ganador o None si no hay ganador.
fn simulaPartida(mut board: GameY, rng: &mut impl rand::Rng) -> Option<PlayerId> {
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
