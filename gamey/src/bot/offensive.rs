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