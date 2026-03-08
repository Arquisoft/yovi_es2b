use crate::bot_server::state::AppState;
use crate::service::game_service::{
    ActionRequest, CreateGameResponse, GameServiceError, GameStateResponse, GameStatusDto,
    PlaceMoveRequest,
};

use crate::{Coordinates, GameAction, Movement, PlayerId};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;

// Cuerpo del request para crear una partida
#[derive(Deserialize)]
pub struct CreateGameRequest {
    pub board_size: u32,
}

// POST /v1/games
// Crea una nueva partida con el tamaño de tablero indicado
// Entrada: { "board_size": 5 }
// Respuesta: { "game_id": "game-1", "board_size": 5 }
#[axum::debug_handler]
pub async fn create_game(State(state): State<AppState>, Json(body): Json<CreateGameRequest>, ) -> impl IntoResponse {
    //Llamada servicio
    let game_id = state.game_service().create_game(body.board_size);
    //Crear JSON salida
    let response = CreateGameResponse {
        game_id,
        board_size: body.board_size,
    };
    (StatusCode::CREATED, Json(response))
}

// GET /v1/games
// Lista los IDs de todas las partidas activas
// Entrada: (sin body)
// Respuesta: ["game-1", "game-2"]
#[axum::debug_handler]
pub async fn list_games(State(state): State<AppState>) -> Json<Vec<String>> {
    //Json de la lista de juegos
    Json(state.game_service().list_games())
}

// GET /v1/games/{game_id}
// Devuelve el estado actual de la partida
// Entrada: (sin body) GET /v1/games/game-1
// Respuesta: { "game_id": "game-1", "state": { "size": 5, "turn": 0, "players": ["B","R"], "layout": "....." }, "status": { "kind": "Ongoing", "next_player": 0 } }
#[axum::debug_handler]
pub async fn get_game(State(state): State<AppState>, Path(game_id): Path<String>, 
                                                        ) -> Result<Json<GameStateResponse>, GameServiceError> {
    // Hacer un map del gameState en un JSON
    state
        .game_service()
        .get_game_state(&game_id)
        .map(Json)
        .ok_or(GameServiceError::GameNotFound(game_id))
}

// GET /v1/games/{game_id}/status
// Devuelve solo el estado de victoria/ongoing de la partida
// Entrada: (sin body) GET /v1/games/game-1/status
// Respuesta ongoing:  { "kind": "Ongoing",  "next_player": 0 }
// Respuesta finished: { "kind": "Finished", "winner": 1 }
#[axum::debug_handler]
pub async fn get_status( State(state): State<AppState>,Path(game_id): Path<String>,
                                                        ) -> Result<Json<GameStatusDto>, GameServiceError> {
    //Crea json del status de un juego con su gameId
    state
        .game_service()
        .get_status(&game_id)
        .map(Json)
        .ok_or(GameServiceError::GameNotFound(game_id))
}

// POST /v1/games/{game_id}/move
// Aplica un movimiento de colocación de pieza
// Entrada: { "player": 0, "x": 2, "y": 0, "z": 0 }
// Respuesta: { "game_id": "game-1", "state": { ... }, "status": { "kind": "Ongoing", "next_player": 1 } }
#[axum::debug_handler]
pub async fn place_move( State(state): State<AppState>, Path(game_id): Path<String>, Json(body): Json<PlaceMoveRequest>,
                                                        ) -> Result<Json<GameStateResponse>, GameServiceError> {
    //Ejecuta el movimiento
    let movement = Movement::Placement {
        player: PlayerId::new(body.player),
        coords: Coordinates::new(body.x, body.y, body.z),
    };
    //Devuelve Json con el resultado
    state
        .game_service()
        .place_move(&game_id, movement)
        .map(Json)
}

// POST /v1/games/{game_id}/action
// Aplica una acción especial: "resign" o "swap"
// Entrada resign: { "player": 0, "action": "resign" }
// Entrada swap:   { "player": 1, "action": "swap" }
// Respuesta: { "game_id": "game-1", "state": { ... }, "status": { "kind": "Finished", "winner": 1 } }
#[axum::debug_handler]
pub async fn do_action(State(state): State<AppState>, Path(game_id): Path<String>, Json(body): Json<ActionRequest>,
                                                        ) -> Result<Json<GameStateResponse>, GameServiceError> {
    //Aplica accion especial
    let game_action = match body.action.as_str() {
        "resign" => GameAction::Resign,
        "swap" => GameAction::Swap,
        other => {
            return Err(GameServiceError::GameError(format!(
                "Accion desconocida: '{}'. Usa 'resign' o 'swap'",
                other
            )));
        }
    };
    // Hace accion
    let movement = Movement::Action {
        player: PlayerId::new(body.player),
        action: game_action,
    };
    //Devuelve estado
    state
        .game_service()
        .place_move(&game_id, movement)
        .map(Json)
}

// DELETE /v1/games/{game_id}
// Elimina la partida con el ID indicado
// Entrada: (sin body) DELETE /v1/games/game-1
// Respuesta: 204 No Content (si existia) | 404 Not Found (si no existia)
#[axum::debug_handler]
pub async fn delete_game(State(state): State<AppState>, Path(game_id): Path<String>,
                                                        ) -> impl IntoResponse {
    //Lanza codigo
    if state.game_service().delete_game(&game_id) {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}