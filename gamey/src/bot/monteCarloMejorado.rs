// Bot basado en MCTS con RAVE (Rapid Action Value Estimation).
// Responsable: Iyán Iglesias
//
// Diferencia con monteCarlo normal:
//   - monteCarlo: reparte las simulaciones IGUALMENTE entre todas las casillas (100 cada una)
//   - monteCarloMejorado: reparte las simulaciones ADAPTATIVAMENTE con UCB-RAVE,
//     dando mas simulaciones a las casillas prometedoras y menos a las malas
//
// RAVE: si un movimiento fue bueno en CUALQUIER parte de un rollout, probablemente
//       tambien sea bueno como primera jugada. Esto acelera el aprendizaje.
use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

// Total de simulaciones a repartir entre todas las casillas
const TOTAL_SIMULACIONES: u32 = 3000;

// Constante de exploracion UCB (mayor = explora mas, menor = explota mas)
const UCB_C: f64 = 1.4;

// Controla cuando RAVE cede peso a UCB puro.
// Con pocas visitas directas RAVE manda, con muchas manda UCB.
const RAVE_K: f64 = 500.0;

pub struct MonteCarloMejoradoBot;

impl YBot for MonteCarloMejoradoBot {
    fn name(&self) -> &str {
        "montecarlo_mejorado_bot"
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

        let n = available.len();
        let mut rng = rand::rng();

        // Estadisticas directas UCB: visitas y victorias de cada casilla como primera jugada
        let mut visitas = vec![0u32; n];
        let mut victorias = vec![0u32; n];

        // Estadisticas RAVE: visitas y victorias de cada casilla en CUALQUIER punto del rollout
        let mut rave_visitas = vec![0u32; n];
        let mut rave_victorias = vec![0u32; n];

        let mut total_sims = 0u32;

        // Inicializamos con una simulacion por casilla para evitar divisiones por cero
        for i in 0..n {
            let coords = Coordinates::from_index(available[i], board.board_size());
            let mut sim_board = board.clone();
            if sim_board.add_move(Movement::Placement { player, coords }).is_err() {
                continue;
            }
            let (ganador, jugados) = simulaPartida(sim_board, &mut rng);
            visitas[i] += 1;
            total_sims += 1;
            if ganador == Some(player) {
                victorias[i] += 1;
            }
            // Actualiza RAVE con todos los movimientos del rollout
            actualizaRave(&available, &jugados, ganador, player, &mut rave_visitas, &mut rave_victorias);
        }

        // Simulaciones restantes guiadas por UCB-RAVE
        for _ in n as u32..TOTAL_SIMULACIONES {
            // Seleccionamos la casilla con mayor puntuacion UCB-RAVE
            let idx = seleccionaUCBRAVE(&visitas, &victorias, &rave_visitas, &rave_victorias, total_sims);

            let coords = Coordinates::from_index(available[idx], board.board_size());
            let mut sim_board = board.clone();
            if sim_board.add_move(Movement::Placement { player, coords }).is_err() {
                continue;
            }

            let (ganador, jugados) = simulaPartida(sim_board, &mut rng);
            visitas[idx] += 1;
            total_sims += 1;
            if ganador == Some(player) {
                victorias[idx] += 1;
            }
            actualizaRave(&available, &jugados, ganador, player, &mut rave_visitas, &mut rave_victorias);
        }

        // Elegimos la casilla con mas visitas (politica robusta de MCTS, mas estable que max win rate)
        let mut best_idx = 0;
        for i in 0..n {
            if visitas[i] > visitas[best_idx] {
                best_idx = i;
            }
        }

        return Some(Coordinates::from_index(available[best_idx], board.board_size()));
    }
}

// Actualiza las estadisticas RAVE con los movimientos jugados en un rollout.
// Si una celda del rollout coincide con una candidata, cuenta como observacion RAVE.
fn actualizaRave(
    available: &[u32],
    jugados: &[u32],
    ganador: Option<PlayerId>,
    player: PlayerId,
    rave_visitas: &mut Vec<u32>,
    rave_victorias: &mut Vec<u32>,
) {
    for &cell_jugado in jugados {
        if let Some(j) = available.iter().position(|&c| c == cell_jugado) {
            rave_visitas[j] += 1;
            if ganador == Some(player) {
                rave_victorias[j] += 1;
            }
        }
    }
}

// Calcula la puntuacion UCB-RAVE de cada casilla y devuelve el indice de la mejor.
//
// Formula:
//   score = (1 - beta) * ucb_valor + beta * rave_valor + ucb_exploracion
//
//   ucb_valor      = victorias / visitas           (explotacion directa)
//   rave_valor     = rave_victorias / rave_visitas  (explotacion RAVE)
//   ucb_exploracion = C * sqrt(ln(total) / visitas) (incentivo a explorar poco visitadas)
//   beta           = sqrt(K / (3*visitas + K))     (peso de RAVE, decrece con visitas)
fn seleccionaUCBRAVE(
    visitas: &[u32],
    victorias: &[u32],
    rave_visitas: &[u32],
    rave_victorias: &[u32],
    total_sims: u32,
) -> usize {
    let mut best_idx = 0;
    let mut best_score = f64::NEG_INFINITY;

    for i in 0..visitas.len() {
        let v = visitas[i] as f64;
        let w = victorias[i] as f64;
        let rv = rave_visitas[i] as f64;
        let rw = rave_victorias[i] as f64;

        // Valor directo UCB
        let ucb_valor = if v > 0.0 { w / v } else { 0.0 };
        let ucb_exploracion = UCB_C * ((total_sims as f64).ln() / (v + 1.0)).sqrt();

        // Valor RAVE (prior neutro 0.5 si no hay datos)
        let rave_valor = if rv > 0.0 { rw / rv } else { 0.5 };

        // Beta: peso de RAVE vs UCB. Decrece conforme aumentan las visitas directas.
        let beta = (RAVE_K / (3.0 * v + RAVE_K)).sqrt();

        let score = (1.0 - beta) * ucb_valor + beta * rave_valor + ucb_exploracion;

        if score > best_score {
            best_score = score;
            best_idx = i;
        }
    }

    best_idx
}

// Simula una partida completa con movimientos aleatorios.
// Devuelve el jugador ganador y la lista de celdas jugadas durante el rollout.
fn simulaPartida(mut board: GameY, rng: &mut impl rand::Rng) -> (Option<PlayerId>, Vec<u32>) {
    let mut jugados: Vec<u32> = Vec::new();

    while !board.check_game_over() {
        let available = board.available_cells().clone();
        if available.is_empty() {
            break;
        }
        let player = match board.next_player() {
            Some(p) => p,
            None => break,
        };
        let cell = match available.choose(rng) {
            Some(&c) => c,
            None => break,
        };
        let coords = Coordinates::from_index(cell, board.board_size());
        let _resultado = board.add_move(Movement::Placement { player, coords });
        jugados.push(cell);
    }

    let ganador = match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    };

    return (ganador, jugados);
}
