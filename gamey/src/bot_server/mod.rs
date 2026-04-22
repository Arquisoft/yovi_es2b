//! HTTP server for Y game bots.
//!
//! This module provides an Axum-based REST API for querying Y game bots.
//! The server exposes endpoints for checking bot status and requesting moves.
//!
//! # Endpoints
//! - `GET /status` - Health check endpoint
//! - `GET /metrics` - Prometheus metrics endpoint
//! - `POST /play` - Request a move from a bot
//!
//! # Example
//! ```no_run
//! use gamey::run_bot_server;
//!
//! #[tokio::main]
//! async fn main() {
//!     if let Err(e) = run_bot_server(3000).await {
//!         eprintln!("Server error: {}", e);
//!     }
//! }
//! ```

pub mod choose;
pub mod error;
pub mod state;
pub mod version;
use axum::response::IntoResponse;
use axum_prometheus::PrometheusMetricLayer;
use std::sync::Arc;
pub use choose::MoveResponse;
pub use error::ErrorResponse;
pub use version::*;

use crate::{DefensiveBot, GameYError, MonteCarloBot, MonteCarloEndurecidoBot, MonteCarloMejoradoBot, OffensiveBot, RandomBot, YBotRegistry, state::AppState};
use tower_http::cors::{Any, CorsLayer};

/// Creates the Axum router with the given state.
/// This is useful for testing the API without binding to a network port.
pub fn create_router(state: AppState) -> axum::Router {
    let game_routes = crate::service::game_router();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let (prometheus_layer, metric_handle) = PrometheusMetricLayer::pair();

    axum::Router::new()
        .route("/status", axum::routing::get(status))
        .route("/metrics", axum::routing::get(move || async move { metric_handle.render() }))
        .route("/play", axum::routing::post(choose::choose))
        .merge(game_routes)
        .layer(prometheus_layer)
        .layer(cors)
        .with_state(state)
}

/// Creates the default application state with the standard bot registry.
///
/// The default state includes the `RandomBot` which selects moves randomly.
pub fn create_default_state() -> AppState {
    let bots = YBotRegistry::new()
        .with_bot(Arc::new(RandomBot))
        .with_bot(Arc::new(DefensiveBot))
        .with_bot(Arc::new(OffensiveBot))
        .with_bot(Arc::new(MonteCarloBot))
        .with_bot(Arc::new(MonteCarloMejoradoBot))
        .with_bot(Arc::new(MonteCarloEndurecidoBot));
    AppState::new(bots)
}

/// Starts the bot server on the specified port.
///
/// This function blocks until the server is shut down.
///
/// # Arguments
/// * `port` - The TCP port to listen on
///
/// # Errors
/// Returns `GameYError::ServerError` if:
/// - The TCP port cannot be bound (e.g., port already in use, permission denied)
/// - The server encounters an error while running
pub async fn run_bot_server(port: u16) -> Result<(), GameYError> {
    let state = create_default_state();
    let app = create_router(state);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .map_err(|e| GameYError::ServerError {
            message: format!("Failed to bind to {}: {}", addr, e),
        })?;

    println!("Server mode: Listening on http://{}", addr);
    axum::serve(listener, app)
        .await
        .map_err(|e| GameYError::ServerError {
            message: format!("Server error: {}", e),
        })?;

    Ok(())
}

/// Health check endpoint handler.
///
/// Returns "OK" to indicate the server is running.
pub async fn status() -> impl IntoResponse {
    "OK"
}
