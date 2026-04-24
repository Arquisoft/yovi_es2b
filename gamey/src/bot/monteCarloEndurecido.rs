// Bot basado en Monte Carlo con rollouts heurísticos.
// Responsable: Iyán Iglesias
use crate::{Coordinates, GameY, YBot};
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_casilla, simula_partida};

pub fn choose_move_endurecido(board: &GameY, simulations: u32) -> Option<Coordinates> {
    let player = board.next_player()?;
    let available = board.available_cells().clone();

    if available.is_empty() {
        return None;
    }

    if let Some(coords) = busca_ganador(board, player, &available) {
        return Some(coords);
    }

    let mut rng = rand::rng();
    let mut wins = vec![0u32; available.len()];

    for i in 0..available.len() {
        let coords = Coordinates::from_index(available[i], board.board_size());
        wins[i] = simula_casilla(board, player, coords, simulations, &mut rng, simula_partida);
    }

    Some(Coordinates::from_index(available[mejor_casilla(&wins)], board.board_size()))
}

pub struct MonteCarloEndurecidoBot;

impl YBot for MonteCarloEndurecidoBot {
    fn name(&self) -> &str {
        "montecarlo_endurecido_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        choose_move_endurecido(board, 100)
    }
}