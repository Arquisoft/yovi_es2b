use crate::{Coordinates, GameY, YEN, error::ErrorResponse, state::AppState};
use axum::{
    Json,
    extract::State,
};
use serde::{Deserialize, Serialize};

/// Request body for the play endpoint.
#[derive(Deserialize)]
pub struct PlayRequest {
    /// The current game state in YEN format.
    pub position: YEN,
    /// The identifier of the bot to use (optional, defaults to "random_bot").
    pub bot_type: Option<String>,
}

/// Response returned by the play endpoint on success.
///
/// Contains the bot's chosen move coordinates and which bot was used.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct MoveResponse {
    /// The bot that selected this move.
    pub bot_id: String,
    /// The coordinates where the bot chooses to place its piece.
    pub coords: Coordinates,
}

/// Handler for the bot move selection endpoint.
///
/// This endpoint accepts a game state and optional bot type, and returns the
/// coordinates of the bot's chosen move.
///
/// # Route
/// `POST /play`
///
/// # Request Body
/// A JSON object with:
/// - `position`: the current game state in YEN format (required)
/// - `bot_type`: the bot identifier to use (optional, defaults to "random_bot")
///
/// # Response
/// On success, returns a `MoveResponse` with the chosen coordinates.
/// On failure, returns an `ErrorResponse` with details about what went wrong.
#[axum::debug_handler]
pub async fn choose(
    State(state): State<AppState>,
    Json(body): Json<PlayRequest>,
) -> Result<Json<MoveResponse>, ErrorResponse> {
    let bot_id = body.bot_type.unwrap_or_else(|| "random_bot".to_string());
    let game_y = match GameY::try_from(body.position) {
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
    let response = MoveResponse {
        bot_id,
        coords,
    };
    Ok(Json(response))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_move_response_creation() {
        let response = MoveResponse {
            bot_id: "random_bot".to_string(),
            coords: Coordinates::new(1, 2, 3),
        };
        assert_eq!(response.bot_id, "random_bot");
        assert_eq!(response.coords, Coordinates::new(1, 2, 3));
    }

    #[test]
    fn test_move_response_serialize() {
        let response = MoveResponse {
            bot_id: "random_bot".to_string(),
            coords: Coordinates::new(1, 2, 3),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"bot_id\":\"random_bot\""));
    }

    #[test]
    fn test_move_response_deserialize() {
        let json = r#"{"bot_id":"test","coords":{"x":0,"y":1,"z":2}}"#;
        let response: MoveResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.bot_id, "test");
    }

    #[test]
    fn test_move_response_clone() {
        let response = MoveResponse {
            bot_id: "random_bot".to_string(),
            coords: Coordinates::new(0, 0, 0),
        };
        let cloned = response.clone();
        assert_eq!(response, cloned);
    }

    #[test]
    fn test_move_response_equality() {
        let r1 = MoveResponse {
            bot_id: "random_bot".to_string(),
            coords: Coordinates::new(1, 1, 1),
        };
        let r2 = MoveResponse {
            bot_id: "random_bot".to_string(),
            coords: Coordinates::new(1, 1, 1),
        };
        let r3 = MoveResponse {
            bot_id: "defensive_bot".to_string(),
            coords: Coordinates::new(1, 1, 1),
        };
        assert_eq!(r1, r2);
        assert_ne!(r1, r3);
    }
}
