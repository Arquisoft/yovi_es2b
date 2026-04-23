use crate::{Coordinates, GameY, YBot};
use super::monteCarloEndurecido::choose_move_endurecido;

pub struct MonteCarloEndurecidoConcursoBot;

impl YBot for MonteCarloEndurecidoConcursoBot {
    fn name(&self) -> &str {
        "montecarlo_endurecido_concurso_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        choose_move_endurecido(board, 250)
    }
}
