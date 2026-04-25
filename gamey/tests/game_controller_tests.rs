use axum::{body::Body, http::{Request, StatusCode}};
use gamey::{create_default_state, create_test_router};
use http_body_util::BodyExt;
use tower::ServiceExt;

// Helper para no repetir la creacion del app
fn make_app() -> axum::Router {
    create_test_router(create_default_state())
}

// Test
// Pruebas de las rutas
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

    // GET /v1/games -> 200
    let res = app.clone()
        .oneshot(Request::builder().uri("/v1/games").body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // GET /v1/games/{id} -> 200
    let res = app.clone()
        .oneshot(Request::builder().uri(format!("/v1/games/{}", id)).body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // GET /v1/games/{id}/status -> 200
    let res = app.clone()
        .oneshot(Request::builder().uri(format!("/v1/games/{}/status", id)).body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // POST /v1/games/{id}/move -> 200
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri(format!("/v1/games/{}/move", id))
            .header("content-type", "application/json")
            .body(Body::from(r#"{"player":0,"x":2,"y":1,"z":1}"#))
            .unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // POST /v1/games/{id}/undo -> 200
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri(format!("/v1/games/{}/undo", id))
            .body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // POST /v1/games/{id}/action swap -> 200
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri(format!("/v1/games/{}/action", id))
            .header("content-type", "application/json")
            .body(Body::from(r#"{"player":0,"action":"swap"}"#))
            .unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // POST /v1/games/{id}/action resign -> 200
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri(format!("/v1/games/{}/action", id))
            .header("content-type", "application/json")
            .body(Body::from(r#"{"player":0,"action":"resign"}"#))
            .unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // DELETE /v1/games/{id} -> 204 No Content
    let res = app.clone()
        .oneshot(Request::builder()
            .method("DELETE").uri(format!("/v1/games/{}", id))
            .body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);
}

// Test
// Errores: partida inexistente y accion desconocida
#[tokio::test]
async fn test_errores() {
    let app = make_app();

    // GET /v1/games/noexiste -> 404 (cubre ok_or de get_game)
    let res = app.clone()
        .oneshot(Request::builder().uri("/v1/games/noexiste").body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);

    // GET /v1/games/noexiste/status -> 404 (cubre ok_or de get_status)
    let res = app.clone()
        .oneshot(Request::builder().uri("/v1/games/noexiste/status").body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);

    // POST /v1/games/noexiste/action con accion desconocida -> 400
    let res = app.clone()
        .oneshot(Request::builder()
            .method("POST").uri("/v1/games/noexiste/action")
            .header("content-type", "application/json")
            .body(Body::from(r#"{"player":0,"action":"foobar"}"#))
            .unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);

    // DELETE /v1/games/noexiste -> 404 (cubre rama else de delete_game)
    let res = app.clone()
        .oneshot(Request::builder()
            .method("DELETE").uri("/v1/games/noexiste")
            .body(Body::empty()).unwrap())
        .await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}



