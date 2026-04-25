use crate::{Coordinates, GameY, YEN, error::ErrorResponse, state::AppState};
use axum::{
    Json,
    extract::{Query, State},
};
use serde::{Deserialize, Serialize};

/// Query parameters for the play endpoint.
#[derive(Deserialize)]
pub struct PlayRequest {
    /// The current game state in YEN format (JSON-encoded string).
    pub position: String,
    /// The identifier of the bot to use (optional, defaults to "montecarlo_endurecido_bot").
    pub bot_id: Option<String>,
}

/// Response returned by the play endpoint — either a move or a special action.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(untagged)]
pub enum PlayResponse {
    Move { coords: Coordinates },
    Action { action: String },
}

// Keep MoveResponse as a type alias for backwards compatibility in tests.
pub type MoveResponse = PlayResponse;

/// Returns true if the bot should swap on this position.
///
/// Swap (pie rule) is offered when it is the second player's very first move
/// and the first player's stone occupies a strong central position.
/// A position is considered strong when min(x, y, z) >= (size - 1) / 3,
/// meaning the stone is close to the centre of the board.
fn should_swap(yen: &YEN) -> bool {
    if yen.turn() != 1 {
        return false;
    }
    let layout = yen.layout();
    let stone_count = layout.chars().filter(|&c| c != '.' && c != '/').count();
    if stone_count != 1 {
        return false;
    }
    // Find the single stone's barycentric coordinates by walking the layout rows.
    let size = yen.size();
    for (r, row) in layout.split('/').enumerate() {
        for (c, ch) in row.chars().enumerate() {
            if ch != '.' {
                let x = size - 1 - r as u32;
                let y = c as u32;
                let z = (size - 1) - x - y;
                let min_coord = x.min(y).min(z);
                return min_coord >= (size - 1) / 3;
            }
        }
    }
    false
}

/// Handler for the bot move selection endpoint.
///
/// # Route
/// `GET /play`
///
/// # Query Parameters
/// - `position`: the current game state in YEN format as a JSON string (required)
/// - `bot_id`: the bot identifier to use (optional, defaults to "montecarlo_endurecido_bot")
///
/// # Response
/// `{"coords":{"x":...,"y":...,"z":...}}` for a normal move, or `{"action":"swap"}` for the pie rule.
#[axum::debug_handler]
pub async fn choose(
    State(state): State<AppState>,
    Query(params): Query<PlayRequest>,
) -> Result<Json<PlayResponse>, ErrorResponse> {
    let bot_id = params.bot_id.unwrap_or_else(|| "montecarlo_endurecido_bot".to_string());
    let yen: YEN = match serde_json::from_str(&params.position) {
        Ok(yen) => yen,
        Err(err) => {
            return Err(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                None,
                Some(bot_id),
            ));
        }
    };

    if should_swap(&yen) {
        return Ok(Json(PlayResponse::Action { action: "swap".to_string() }));
    }

    let game_y = match GameY::try_from(yen) {
        Ok(game) => game,
        Err(err) => {
            return Err(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                None,
                Some(bot_id),
            ));
        }
    };
    let bot = match state.bots().find(&bot_id) {
        Some(bot) => bot,
        None => {
            let available_bots = state.bots().names().join(", ");
            return Err(ErrorResponse::error(
                &format!(
                    "Bot not found: {}, available bots: [{}]",
                    bot_id, available_bots
                ),
                None,
                Some(bot_id),
            ));
        }
    };
    let coords = match bot.choose_move(&game_y) {
        Some(coords) => coords,
        None => {
            return Err(ErrorResponse::error(
                "No valid moves available for the bot",
                None,
                Some(bot_id),
            ));
        }
    };
    Ok(Json(PlayResponse::Move { coords }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_move_response_creation() {
        let response = PlayResponse::Move { coords: Coordinates::new(1, 2, 3) };
        assert_eq!(response, PlayResponse::Move { coords: Coordinates::new(1, 2, 3) });
    }

    #[test]
    fn test_move_response_serialize() {
        let response = PlayResponse::Move { coords: Coordinates::new(1, 2, 3) };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"coords\""));
        assert!(!json.contains("\"bot_id\""));
        assert!(!json.contains("\"action\""));
    }

    #[test]
    fn test_action_response_serialize() {
        let response = PlayResponse::Action { action: "swap".to_string() };
        let json = serde_json::to_string(&response).unwrap();
        assert_eq!(json, r#"{"action":"swap"}"#);
    }

    #[test]
    fn test_move_response_deserialize() {
        let json = r#"{"coords":{"x":0,"y":1,"z":2}}"#;
        let response: PlayResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response, PlayResponse::Move { coords: Coordinates::new(0, 1, 2) });
    }

    #[test]
    fn test_action_response_deserialize() {
        let json = r#"{"action":"swap"}"#;
        let response: PlayResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response, PlayResponse::Action { action: "swap".to_string() });
    }

    #[test]
    fn test_move_response_clone() {
        let response = PlayResponse::Move { coords: Coordinates::new(0, 0, 0) };
        assert_eq!(response.clone(), response);
    }

    #[test]
    fn test_should_swap_center_move() {
        // Size 5, turn 1, single stone at center (x=1,y=1,z=2 => min=1 >= (5-1)/3=1)
        let yen = YEN::new(5, 1, vec!['B', 'R'], "..../.../.B./..".to_string());
        assert!(should_swap(&yen));
    }

    #[test]
    fn test_should_not_swap_edge_move() {
        // Size 5, turn 1, single stone on edge (row 0, any corner)
        let yen = YEN::new(5, 1, vec!['B', 'R'], "B.../.../.../..".to_string());
        assert!(!should_swap(&yen));
    }

    #[test]
    fn test_should_not_swap_wrong_turn() {
        let yen = YEN::new(5, 0, vec!['B', 'R'], "..../.../.B./..".to_string());
        assert!(!should_swap(&yen));
    }

    #[test]
    fn test_should_not_swap_multiple_stones() {
        let yen = YEN::new(5, 1, vec!['B', 'R'], "B.../B../.B./..".to_string());
        assert!(!should_swap(&yen));
    }
}
