// Bot basado en Monte Carlo con UCB (Upper Confidence Bound).
// Responsable: Iyán Iglesias
//
// Diferencia con monteCarlo normal:
//   - monteCarlo: reparte las simulaciones IGUALMENTE entre todas las casillas (100 cada una)
//   - monteCarloMejorado: reparte las simulaciones ADAPTATIVAMENTE con UCB,
//     dando mas simulaciones a las casillas prometedoras y menos a las malas
use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use super::monteCarloUtil::{busca_ganador, mejor_casilla, simula_partida};

const TOTAL_SIMULACIONES: u32 = 200;
const UCB_C: f64 = 1.4;

pub struct MonteCarloMejoradoBot;

impl YBot for MonteCarloMejoradoBot {
    fn name(&self) -> &str {
        "montecarlo_mejorado_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

        //Sin casillas libres   
        if available.is_empty() {
            return None;
        }

        //Moviemiento ganador inmediato
        if let Some(coords) = busca_ganador(board, player, &available) {
            return Some(coords);
        }

        let n = available.len();
        let mut rng = rand::rng();
        let mut visitas = vec![0u32; n];
        let mut victorias = vec![0u32; n];
        let mut total_sims = 0u32;

        // Inicializamos con una simulacion por casilla para evitar divisiones por cero
        for i in 0..n {
            let coords = Coordinates::from_index(available[i], board.board_size());
            if let Some(gano) = ejecuta_una_sim(board, player, coords, &mut rng) {
                visitas[i] += 1;
                total_sims += 1;
                victorias[i] += gano as u32;
            }
        }

        // Simulaciones restantes guiadas por UCB
        for _ in n as u32..TOTAL_SIMULACIONES {
            let idx = selecciona_ucb(&visitas, &victorias, total_sims);
            let coords = Coordinates::from_index(available[idx], board.board_size());
            if let Some(gano) = ejecuta_una_sim(board, player, coords, &mut rng) {
                visitas[idx] += 1;
                total_sims += 1;
                victorias[idx] += gano as u32;
            }
        }

        return Some(Coordinates::from_index(available[mejor_casilla(&visitas)], board.board_size()));
    }
}

// Ejecuta una simulacion para una casilla dada y devuelve si el jugador gano.
fn ejecuta_una_sim(board: &GameY, player: PlayerId, coords: Coordinates, rng: &mut impl rand::Rng) -> Option<bool> {
    let mut sim_board = board.clone();
    sim_board.add_move(Movement::Placement { player, coords }).ok()?;
    return Some(simula_partida(sim_board, rng) == Some(player));
}

// Calcula la puntuacion UCB de cada casilla y devuelve el indice de la mejor.
//
// Formula: victorias/visitas + C * sqrt(ln(total) / visitas)
fn selecciona_ucb(visitas: &[u32], victorias: &[u32], total_sims: u32) -> usize {
    let mut best_idx = 0;
    let mut best_score = f64::NEG_INFINITY;

    for i in 0..visitas.len() {
        let v = visitas[i] as f64;
        let w = victorias[i] as f64;
        let explotacion = if v > 0.0 { w / v } else { 0.0 };
        let exploracion = UCB_C * ((total_sims as f64).ln() / (v + 1.0)).sqrt();
        let score = explotacion + exploracion;

        if score > best_score {
            best_score = score;
            best_idx = i;
        }
    }

    return best_idx;
}