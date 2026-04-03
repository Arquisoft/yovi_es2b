pub mod game_service;
pub mod gameControler;

use crate::bot_server::state::AppState;
use crate::service::gameControler::{
    create_game, delete_game, do_action, get_game, get_status, list_games, place_move, undo_move,
};

/// Devuelve el router de Axum con todas las rutas del juego.
/// Se conecta al router principal en bot_server/mod.rs.
pub fn game_router() -> axum::Router<AppState> {
    axum::Router::new()
        .route("/v1/games",                   axum::routing::post(create_game))
        .route("/v1/games",                   axum::routing::get(list_games))
        .route("/v1/games/{game_id}",         axum::routing::get(get_game))
        .route("/v1/games/{game_id}",         axum::routing::delete(delete_game))
        .route("/v1/games/{game_id}/status",  axum::routing::get(get_status))
        .route("/v1/games/{game_id}/move",    axum::routing::post(place_move))
        .route("/v1/games/{game_id}/action",  axum::routing::post(do_action))
        .route("/v1/games/{game_id}/undo",    axum::routing::post(undo_move))
}
