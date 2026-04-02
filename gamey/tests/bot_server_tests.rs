use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use gamey::{YBotRegistry, YEN, create_default_state, create_router, state::AppState, RandomBot, MoveResponse, ErrorResponse};
use http_body_util::BodyExt;
use std::sync::Arc;
use tower::ServiceExt;

/// Helper to create a test app with the default state
fn test_app() -> axum::Router {
    create_router(create_default_state())
}

/// Helper to create a test app with a custom state
fn test_app_with_state(state: AppState) -> axum::Router {
    create_router(state)
}

/// Helper to build a JSON body for the /play endpoint
fn play_body(yen: &YEN, bot_type: Option<&str>) -> String {
    match bot_type {
        Some(bot) => serde_json::json!({ "position": yen, "bot_type": bot }).to_string(),
        None => serde_json::json!({ "position": yen }).to_string(),
    }
}

// ============================================================================
// Status endpoint tests
// ============================================================================

#[tokio::test]
async fn test_status_endpoint_returns_ok() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(&body[..], b"OK");
}

// ============================================================================
// Play endpoint tests - Success cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_valid_request() {
    let app = test_app();

    // Create a valid YEN (Y-game Exchange Notation) for a size 3 board
    // Layout: empty board with 3 rows (size 3): row1=1cell, row2=2cells, row3=3cells
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, Some("random_bot"))))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.bot_id, "random_bot");
    // Coordinates should be valid (we can't predict exactly which one the random bot picks)
}

#[tokio::test]
async fn test_choose_endpoint_with_partially_filled_board() {
    let app = test_app();

    // Board with some cells already filled: B in first cell, R in second
    let yen = YEN::new(3, 2, vec!['B', 'R'], "B/R./.B.".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, Some("random_bot"))))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.bot_id, "random_bot");
}

#[tokio::test]
async fn test_choose_endpoint_without_bot_type_uses_default() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, None)))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.bot_id, "random_bot");
}

// ============================================================================
// Play endpoint tests - Error cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_unknown_bot() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, Some("unknown_bot"))))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
    assert!(error_response.message.contains("unknown_bot"));
    assert_eq!(error_response.bot_id, Some("unknown_bot".to_string()));
}

#[tokio::test]
async fn test_choose_endpoint_with_invalid_json() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from("{ invalid json }"))
                .unwrap(),
        )
        .await
        .unwrap();

    // Invalid JSON should return a 4xx error
    assert!(response.status().is_client_error());
}

#[tokio::test]
async fn test_choose_endpoint_with_missing_content_type() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                // No content-type header
                .body(Body::from(play_body(&yen, Some("random_bot"))))
                .unwrap(),
        )
        .await
        .unwrap();

    // Missing content-type should return an error
    assert!(response.status().is_client_error());
}

// ============================================================================
// Custom state tests
// ============================================================================

#[tokio::test]
async fn test_choose_with_custom_bot_registry() {
    // Create a custom registry with only the random bot
    let bots = YBotRegistry::new().with_bot(Arc::new(RandomBot));
    let state = AppState::new(bots);
    let app = test_app_with_state(state);

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, Some("random_bot"))))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_choose_with_empty_bot_registry() {
    // Create an empty registry
    let bots = YBotRegistry::new();
    let state = AppState::new(bots);
    let app = test_app_with_state(state);

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(play_body(&yen, None)))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
}

// ============================================================================
// Route not found tests
// ============================================================================

#[tokio::test]
async fn test_unknown_route_returns_404() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/unknown/route")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_wrong_method_on_status_endpoint() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // POST to a GET-only endpoint should return 405 Method Not Allowed
    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn test_get_on_play_endpoint_returns_method_not_allowed() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/play")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}
