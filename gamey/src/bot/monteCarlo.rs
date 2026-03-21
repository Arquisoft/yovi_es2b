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
            wins[i] = simulasCasilla(board, player, coords, &mut rng);
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

// Ejecuta SIMULATIONS_PER_MOVE simulaciones para una casilla y devuelve el numero de victorias.
fn simulasCasilla(board: &GameY, player: PlayerId, coords: Coordinates, rng: &mut impl rand::Rng) -> u32 {
    let mut wins = 0u32;
    for _ in 0..SIMULATIONS_PER_MOVE {
        let mut sim_board = board.clone();
        if sim_board.add_move(Movement::Placement { player, coords }).is_err() {
            break;
        }
        if simulaPartida(sim_board, rng) == Some(player) {
            wins += 1;
        }
    }
    wins
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


#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_montecarlo_bot_name() {
        let bot = MonteCarloBot;
        assert_eq!(bot.name(), "montecarlo_bot");
    }

    #[test]
    fn test_montecarlo_bot_returns_move_on_empty_board() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_montecarlo_bot_returns_valid_coordinates() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_montecarlo_bot_returns_none_on_full_board() {
        let bot = MonteCarloBot;
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
    fn test_montecarlo_bot_chooses_from_available_cells() {
        let bot = MonteCarloBot;
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
    fn test_montecarlo_bot_multiple_calls_return_valid_moves() {
        let bot = MonteCarloBot;
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