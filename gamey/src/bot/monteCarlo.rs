//! A simple random bot implementation.
//!
//! This module provides [`RandomBot`], a bot that makes random valid moves.
//! It is useful for testing and as a baseline opponent.

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves randomly from the available cells.
///
/// This is the simplest possible bot implementation - it simply picks
/// a random empty cell on the board. While not strategic, it serves as
/// a useful baseline and testing tool.
///
/// # Example
///
/// ```
/// use gamey::{GameY, RandomBot, YBot};
///
/// let bot = RandomBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct MonteCarloBot;

impl YBot for MonteCarloBot {
    fn name(&self) -> &str {
        "montecarlo_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        let cell = available_cells.choose(&mut rand::rng())?;
        let coordinates = Coordinates::from_index(*cell, board.board_size());
        Some(coordinates)
    }
}

