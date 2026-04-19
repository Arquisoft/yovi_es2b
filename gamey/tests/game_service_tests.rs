use axum::response::IntoResponse;
use gamey::service::game_service::GameService;
use gamey::{Coordinates, GameAction, Movement, PlayerId};

// Test
//Creacion de juego
//Hacer movimiento
//Listar juegos
//Borrar juego
#[test]
fn test_flujo_basico() {
    let svc = GameService::new();
    let id = svc.create_game(5);

    let state = svc.get_game_state(&id).unwrap();
    assert_eq!(state.game_id, id);

    let mov = Movement::Placement {
        player: PlayerId::new(0),
        coords: Coordinates::new(2, 1, 1),
    };
    svc.place_move(&id, mov).unwrap();

    svc.get_status(&id).unwrap();
    assert_eq!(svc.list_games().len(), 1);

    svc.undo_move(&id).unwrap();
    assert!(svc.delete_game(&id));
}

// Test
// Juego estado finalizado
#[test]
fn test_partida_terminada() {
    let svc = GameService::new();
    let id = svc.create_game(5);

    let resign = Movement::Action {
        player: PlayerId::new(0),
        action: GameAction::Resign,
    };
    svc.place_move(&id, resign).unwrap();

    svc.get_game_state(&id).unwrap(); // status es Finished 
}

// Test
// Comprabacion errores
#[test]
fn test_errores_y_nones() {
    let svc = GameService::new();
    let id = svc.create_game(5);

    // place_move sobre id inexistente -> GameNotFound 
    let mov_dummy = Movement::Placement {
        player: PlayerId::new(0),
        coords: Coordinates::new(2, 1, 1),
    };
    let err_notfound = svc.place_move("noexiste", mov_dummy).unwrap_err();
    err_notfound.into_response();

    // colocamos en (2,1,1) y lo intentamos de nuevo -> Occupied -> From<GameYError> 
    let mov1 = Movement::Placement {
        player: PlayerId::new(0),
        coords: Coordinates::new(2, 1, 1),
    };
    svc.place_move(&id, mov1).unwrap();

    let mov2 = Movement::Placement {
        player: PlayerId::new(0),
        coords: Coordinates::new(2, 1, 1),
    };
    let err_game = svc.place_move(&id, mov2).unwrap_err();
    err_game.into_response();

    // undo GameNotFound
    svc.undo_move("noexiste").unwrap_err();

    // undo hasta dejar el historial con un solo estado y volver a intentarlo
    svc.undo_move(&id).unwrap();
    svc.undo_move(&id).unwrap_err(); // history.len() <= 1

    // get_game_state None
    assert!(svc.get_game_state("noexiste").is_none());

    // delete_game false
    assert!(!svc.delete_game("noexiste"));
}
