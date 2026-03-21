// Bot que sigue estrategia ofensiva
// Se centra en priorizar casillas con mas contacto

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;


pub struct OffensiveBot;

impl YBot for OffensiveBot {
    fn name(&self) -> &str {
        "offensive_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();

        //Si no hay casillas libres retorna
        if available_cells.is_empty() {
            return None;
        }

        // Buscamos casilla con mas lados tocados
        let mut best_score = 0;
        // &idx para tener el valor directamente
        for &idx in available_cells {
            let coords = Coordinates::from_index(idx, board.board_size());
            let score = sides_touched(coords);
            if score > best_score {
                best_score = score;
            }
        }

        // Recogemos todas las casillas con esa puntuacion
        let mut best_cells: Vec<u32> = Vec::new();
        for &idx in available_cells {
            let coords = Coordinates::from_index(idx, board.board_size());
            if sides_touched(coords) == best_score {
                best_cells.push(idx);
            }
        }

        //Se elige una casilla random para evitar que siempre pueda seguir el mismo patron en 
        // partidas sucesivas
        let cell = best_cells.choose(&mut rand::rng())?;
        Some(Coordinates::from_index(*cell, board.board_size()))
    }
}

fn sides_touched(coords: Coordinates) -> u32 {
    let mut count = 0;
    if coords.touches_side_a() {
        count += 1;
    }
    if coords.touches_side_b() {
        count += 1;
    }
    if coords.touches_side_c() {
        count += 1;
    }
    count
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Movement, PlayerId};

    #[test]
    fn test_offensive_bot_name() {
        let bot = OffensiveBot;
        assert_eq!(bot.name(), "offensive_bot");
    }

    #[test]
    fn test_offensive_bot_returns_move_on_empty_board() {
        let bot = OffensiveBot;
        let game = GameY::new(5);

        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_offensive_bot_returns_valid_coordinates() {
        let bot = OffensiveBot;
        let game = GameY::new(5);

        let coords = bot.choose_move(&game).unwrap();
        let index = coords.to_index(game.board_size());

        // Total cells = (5 * 6) / 2 = 15
        assert!(index < 15);
    }

    #[test]
    fn test_offensive_bot_returns_none_on_full_board() {
        let bot = OffensiveBot;
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
    fn test_offensive_bot_chooses_from_available_cells() {
        let bot = OffensiveBot;
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
    fn test_offensive_bot_multiple_calls_return_valid_moves() {
        let bot = OffensiveBot;
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