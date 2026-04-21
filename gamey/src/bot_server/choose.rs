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

/// Response returned by the play endpoint on success.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct MoveResponse {
    /// The coordinates where the bot chooses to place its piece.
    pub coords: Coordinates,
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
/// On success, returns `{"coords":{"x":...,"y":...,"z":...}}`.
/// On failure, returns an `ErrorResponse` with details about what went wrong.
#[axum::debug_handler]
pub async fn choose(
    State(state): State<AppState>,
    Query(params): Query<PlayRequest>,
) -> Result<Json<MoveResponse>, ErrorResponse> {
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
    Ok(Json(MoveResponse { coords }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_move_response_creation() {
        let response = MoveResponse {
            coords: Coordinates::new(1, 2, 3),
        };
        assert_eq!(response.coords, Coordinates::new(1, 2, 3));
    }

    #[test]
    fn test_move_response_serialize() {
        let response = MoveResponse {
            coords: Coordinates::new(1, 2, 3),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"coords\""));
        assert!(!json.contains("\"bot_id\""));
    }

    #[test]
    fn test_move_response_deserialize() {
        let json = r#"{"coords":{"x":0,"y":1,"z":2}}"#;
        let response: MoveResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.coords, Coordinates::new(0, 1, 2));
    }

    #[test]
    fn test_move_response_clone() {
        let response = MoveResponse {
            coords: Coordinates::new(0, 0, 0),
        };
        let cloned = response.clone();
        assert_eq!(response, cloned);
    }

    #[test]
    fn test_move_response_equality() {
        let r1 = MoveResponse { coords: Coordinates::new(1, 1, 1) };
        let r2 = MoveResponse { coords: Coordinates::new(1, 1, 1) };
        let r3 = MoveResponse { coords: Coordinates::new(2, 1, 0) };
        assert_eq!(r1, r2);
        assert_ne!(r1, r3);
    }
}
