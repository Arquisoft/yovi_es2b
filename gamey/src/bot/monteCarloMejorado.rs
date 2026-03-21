// Bot basado en Monte Carlo con UCB (Upper Confidence Bound).
// Responsable: Iyán Iglesias
//
// Diferencia con monteCarlo normal:
//   - monteCarlo: reparte las simulaciones IGUALMENTE entre todas las casillas (100 cada una)
//   - monteCarloMejorado: reparte las simulaciones ADAPTATIVAMENTE con UCB,
//     dando mas simulaciones a las casillas prometedoras y menos a las malas
use crate::{Coordinates, GameStatus, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

// Total de simulaciones a repartir entre todas las casillas
const TOTAL_SIMULACIONES: u32 = 500;

// Constante de exploracion UCB (mayor = explora mas, menor = explota mas)
const UCB_C: f64 = 1.4;

pub struct MonteCarloMejoradoBot;

impl YBot for MonteCarloMejoradoBot {
    fn name(&self) -> &str {
        "montecarlo_mejorado_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let player = board.next_player()?;
        let available = board.available_cells().clone();

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
        let mut visitas = vec![0u32; n];
        let mut victorias = vec![0u32; n];
        let mut total_sims = 0u32;

        // Inicializamos con una simulacion por casilla para evitar divisiones por cero
        for i in 0..n {
            let coords = Coordinates::from_index(available[i], board.board_size());
            if let Some(gano) = ejecutaUnaSim(board, player, coords, &mut rng) {
                visitas[i] += 1;
                total_sims += 1;
                victorias[i] += gano as u32;
            }
        }

        // Simulaciones restantes guiadas por UCB
        for _ in n as u32..TOTAL_SIMULACIONES {
            let idx = seleccionaUCB(&visitas, &victorias, total_sims);
            let coords = Coordinates::from_index(available[idx], board.board_size());
            if let Some(gano) = ejecutaUnaSim(board, player, coords, &mut rng) {
                visitas[idx] += 1;
                total_sims += 1;
                victorias[idx] += gano as u32;
            }
        }

        // Elegimos la casilla con mas visitas (politica robusta de MCTS)
        let mut best_idx = 0;
        for i in 0..n {
            if visitas[i] > visitas[best_idx] {
                best_idx = i;
            }
        }

        Some(Coordinates::from_index(available[best_idx], board.board_size()))
    }
}

// Ejecuta una simulacion para una casilla dada y devuelve si el jugador gano.
fn ejecutaUnaSim(board: &GameY, player: PlayerId, coords: Coordinates, rng: &mut impl rand::Rng) -> Option<bool> {
    let mut sim_board = board.clone();
    sim_board.add_move(Movement::Placement { player, coords }).ok()?;
    let ganador = simulaPartida(sim_board, rng);
    Some(ganador == Some(player))
}

// Calcula la puntuacion UCB de cada casilla y devuelve el indice de la mejor.
//
// Formula: victorias/visitas + C * sqrt(ln(total) / visitas)
fn seleccionaUCB(visitas: &[u32], victorias: &[u32], total_sims: u32) -> usize {
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

    best_idx
}

// Simula una partida completa con movimientos aleatorios y devuelve el jugador ganador.
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

    match board.status() {
        GameStatus::Finished { winner } => Some(*winner),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_montecarlo_mejorado_bot_name() {
        let bot = MonteCarloMejoradoBot;
        assert_eq!(bot.name(), "montecarlo_mejorado_bot");
    }

    #[test]
    fn test_montecarlo_mejorado_bot_returns_move_on_empty_board() {
        let bot = MonteCarloMejoradoBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_montecarlo_mejorado_bot_returns_valid_coordinates() {
        let bot = MonteCarloMejoradoBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_montecarlo_mejorado_bot_returns_none_on_full_board() {
        let bot = MonteCarloMejoradoBot;
        let mut game = GameY::new(2);

        // Fill the board (size 2 has 3 cells)
        let moves = vec![
            Movement::Placement {
                player: PlayerId::new(0),
                coords: Coordinates::new(1, 0, 0),
            },
            Movement::Placement {
                player: PlayerId::new(1),
                coords: Coordinates::new(0, 1, 0),
            },
            Movement::Placement {
                player: PlayerId::new(0),
                coords: Coordinates::new(0, 0, 1),
            },
        ];

        for mv in moves {
            game.add_move(mv).unwrap();
        }

        assert!(game.available_cells().is_empty());
        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_none());
    }

    #[test]
    fn test_montecarlo_mejorado_bot_chooses_from_available_cells() {
        let bot = MonteCarloMejoradoBot;
        let mut game = GameY::new(3);

        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 0, 0),
        })
        .unwrap();

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        assert!(game.available_cells().contains(&index));
    }

    #[test]
    fn test_montecarlo_mejorado_bot_multiple_calls_return_valid_moves() {
        let bot = MonteCarloMejoradoBot;
        let game = GameY::new(7);

        for _ in 0..10 {
            let coords = bot.choose_move(&game).unwrap();
            let index = coords.to_index(game.board_size());

            // Total cells for size 7 = (7 * 8) / 2 = 28
            assert!(index < 28);
            assert!(game.available_cells().contains(&index));
        }
    }
}