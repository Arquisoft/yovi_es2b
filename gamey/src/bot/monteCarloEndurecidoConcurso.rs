use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_casilla};

const SIMULATIONS_PER_MOVE: u32 = 100;

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
            wins[i] = simula_casilla(board, player, coords, SIMULATIONS_PER_MOVE, &mut rng, simula_partida_determinista);
        }

        return Some(Coordinates::from_index(available[mejor_casilla(&wins)], board.board_size()));
    }
}

// Simula una partida completa sin aleatoriedad: siempre elige la casilla con mayor puntuacion heuristica.
fn simula_partida_determinista<R: rand::Rng>(mut board: GameY, _rng: &mut R) -> Option<PlayerId> {
    while !board.check_game_over() {
        let available = board.available_cells().clone();
        if available.is_empty() {
            break;
        }
        let player = board.next_player()?;
        let cell = mejor_celda_determinista(&available, &board);
        let coords = Coordinates::from_index(cell, board.board_size());
        let _resultado = board.add_move(Movement::Placement { player, coords });
    }
    return match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    };
}

// Puntua todas las casillas y devuelve siempre la de mayor puntuacion (sin aleatoriedad).
// Puntuacion = (proximidad_al_centro * 2) + lados_tocados
fn mejor_celda_determinista(available: &[u32], board: &GameY) -> u32 {
    let size = board.board_size();
    let ci = (size / 2) as i32;

    let mut best_cell = available[0];
    let mut best_score = i32::MIN;

    for &cell in available {
        let c = Coordinates::from_index(cell, size);
        let dist = (c.x() as i32 - ci).abs()
            + (c.y() as i32 - ci).abs()
            + (c.z() as i32 - ci).abs();
        let sides = c.touches_side_a() as i32
            + c.touches_side_b() as i32
            + c.touches_side_c() as i32;
        let score = (size as i32 - dist) * 2 + sides;
        if score > best_score {
            best_score = score;
            best_cell = cell;
        }
    }

    best_cell
}
