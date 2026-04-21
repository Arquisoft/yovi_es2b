use crate::{Coordinates, GameY, YBot};
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_casilla, simula_partida};

// Más simulaciones que el endurecido original (100) para estimaciones más precisas.
const SIMULATIONS_PER_MOVE: u32 = 250;

pub struct MonteCarloEndurecidoConcursoBot;

impl YBot for MonteCarloEndurecidoConcursoBot {
    fn name(&self) -> &str {
        "montecarlo_endurecido_concurso_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
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
            // simula_partida tiene rollouts estocasticos: cada simulacion explora un futuro distinto,
            // lo que permite que el promedio de victorias sea una estimacion real de la fuerza de la casilla.
            wins[i] = simula_casilla(board, player, coords, SIMULATIONS_PER_MOVE, &mut rng, simula_partida);
        }

        return Some(Coordinates::from_index(available[mejor_casilla(&wins)], board.board_size()));
    }
}
