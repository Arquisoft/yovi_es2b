use axum::{body::Body, http::{Request, StatusCode}};
use gamey::{create_default_state, create_router};
use http_body_util::BodyExt;
use tower::ServiceExt;

// Helper para no repetir la creacion del app
fn make_app() -> axum::Router {
    create_router(create_default_state())
}

// Test
#[tokio::test]
async fn test_flujo_completo() {
    let app = make_app();

    // POST /v1/games -> 201 Created
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri("/v1/games")
            .header("content-type", "application/json")
            .body(Body::from(r#"{"board_size":5}"#))
            .unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    let id = json["game_id"].as_str().unwrap().to_string();

    
}


