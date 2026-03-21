// Bot basado en Monte Carlo con rollouts aleatorios.
// Responsable: Iyán Iglesias
use crate::{Coordinates, GameY, YBot};
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_casilla, simula_partida};

const SIMULATIONS_PER_MOVE: u32 = 100;

pub struct MonteCarloBot;

impl YBot for MonteCarloBot {
    fn name(&self) -> &str {
        "montecarlo_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

        //Sin casillas libres
        if available.is_empty() {
            return None;
        }

        //Movimiento ganador disponible
        if let Some(coords) = busca_ganador(board, player, &available) {
            return Some(coords);
        }

        let mut rng = rand::rng();
        let mut wins = vec![0u32; available.len()];

        for i in 0..available.len() {
            let coords = Coordinates::from_index(available[i], board.board_size());
            wins[i] = simula_casilla(board, player, coords, SIMULATIONS_PER_MOVE, &mut rng, simula_partida);
        }

        return Some(Coordinates::from_index(available[mejor_casilla(&wins)], board.board_size()));
    }
}