// Bot que sigue estrategia defensiva
// Se centra en priorizar casillas centrales

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;


pub struct DefensiveBot;

impl YBot for DefensiveBot {
    fn name(&self) -> &str {
        "defensive_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();

        //Si no hay casillas libres retorna
        if available_cells.is_empty() {
            return None;
        }

        // Buscamos la casilla mas central
        let mut best_score = 0;
        // &idx para tener el valor directamente
        for &idx in available_cells {
            let coords = Coordinates::from_index(idx, board.board_size());
            let score = centrality(coords);
            if score > best_score {
                best_score = score;
            }
        }

        // Recogemos todas las casillas con esa puntuacion
        let mut best_cells: Vec<u32> = Vec::new();
        for &idx in available_cells {
            let coords = Coordinates::from_index(idx, board.board_size());
            if centrality(coords) == best_score {
                best_cells.push(idx);
            }
        }

        //Se elige una casilla random para evitar que siempre pueda seguir el mismo patron en
        // partidas sucesivas
        let cell = best_cells.choose(&mut rand::rng())?;
        Some(Coordinates::from_index(*cell, board.board_size()))
    }
}

fn centrality(coords: Coordinates) -> u32 {
    coords.x().min(coords.y()).min(coords.z())
}
