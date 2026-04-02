use crate::{GameY, GameYError, Movement, YEN};
use crate::core::GameStatus;
use axum::{Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

pub type GameId = String; // Session id
 
// Errores
#[derive(Debug, Serialize)]
pub enum GameServiceError {
    GameNotFound(String), //NO encontrado para la ID
    GameError(String),    //Error de logica
}

impl GameServiceError {
    fn message(&self) -> String {
        match self {
            GameServiceError::GameNotFound(id) => format!("Juego no encontrado con ID: {}", id),
            GameServiceError::GameError(msg) => msg.clone(),
        }
    }
}

//Transforma GameYError en GameServiceError
impl From<GameYError> for GameServiceError {
    fn from(e: GameYError) -> Self {
        GameServiceError::GameError(e.to_string())
    }
}

/// JSON con errores
#[derive(Serialize)]
struct ServiceErrorBody {
    error: String,
}

// Mediante axum convierte un error HTTP
impl IntoResponse for GameServiceError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            GameServiceError::GameNotFound(_) => StatusCode::NOT_FOUND,
            GameServiceError::GameError(_) => StatusCode::BAD_REQUEST,
        };
        (status, Json(ServiceErrorBody { error: self.message() })).into_response()
    }
}

// ─── ENCAPSULACION DE INFORMACION ────────────────────────────────────────────────────────────────────

// Creacion de juego
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateGameResponse {
    pub game_id: GameId, //Id juego
    pub board_size: u32, //Tamaño del tablero
}

// Estado del juego
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GameStateResponse {
    pub game_id: GameId,       //Id del juego
    pub state: YEN,            //Estado del tablero
    pub status: GameStatusDto, //Estado del juego [Ongoing | Finished]
}

// Estado del juego
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind")]
pub enum GameStatusDto {
    Ongoing {           //En marcha
        next_player: u32,  //ID del jugador siguiente (0 o 1)
    },
    Finished {          //Finalizado
        winner: u32,       //ID del jugador ganador (0 o 1)
    },
}

// Transforma GameStatus en GameStatusDto
impl From<&GameStatus> for GameStatusDto {
    fn from(s: &GameStatus) -> Self {
        match s {
            GameStatus::Ongoing { next_player } => GameStatusDto::Ongoing {
                next_player: next_player.id(),
            },
            GameStatus::Finished { winner } => GameStatusDto::Finished {
                winner: winner.id(),
            },
        }
    }
}

// Encapsulacion del movimiento
#[derive(Deserialize, Debug)]
pub struct PlaceMoveRequest {
    pub player: u32,  //ID del jugador que hace el movimiento
    pub x: u32, //Posicion x
    pub y: u32, //Posicion y
    pub z: u32, //Posicion z
}

// Accion especial. Rendirse o intercambiar
#[derive(Deserialize, Debug)]
pub struct ActionRequest {
    pub player: u32,    //ID del jugador
    pub action: String, //Accion
}

// ─── METODOS DE SERVICIO ─────────────────────────────────────────────────────────────────

pub struct GameService {
    games: Mutex<HashMap<GameId, Vec<GameY>>>,  //Historial de estados por partida
    next_id: Mutex<u64>,
}

impl GameService {

    //Constructor service
    pub fn new() -> Self {
        Self {
            games: Mutex::new(HashMap::new()),
            next_id: Mutex::new(1),
        }
    }

    //Creacion nuevo juego con tamaño del tablero
    pub fn create_game(&self, board_size: u32) -> GameId {
        let mut counter = self.next_id.lock().unwrap();
        let id = format!("game-{}", *counter);
        *counter += 1;

        let game = GameY::new(board_size);
        self.games.lock().unwrap().insert(id.clone(), vec![game]);
        id
    }

    // Devuelve state del juego para un id proporcionado
    pub fn get_game_state(&self, game_id: &str) -> Option<GameStateResponse> {
        let games = self.games.lock().unwrap();
        games.get(game_id).and_then(|h| h.last()).map(|game| GameStateResponse {
            game_id: game_id.to_string(),
            state: game.into(),
            status: GameStatusDto::from(game.status()),
        })
    }

    // Ejecuta movimiento
    // Devuelve el estado del juego o GameServiceError
    pub fn place_move(&self, game_id: &str, movement: Movement) -> Result<GameStateResponse, GameServiceError> {
        let mut games = self.games.lock().unwrap();
        let history = games
            .get_mut(game_id)
            .ok_or_else(|| GameServiceError::GameNotFound(game_id.to_string()))?;

        let mut game = history.last().cloned()
            .ok_or_else(|| GameServiceError::GameNotFound(game_id.to_string()))?;
        game.add_move(movement)?;
        history.push(game);

        let game = history.last().unwrap();
        Ok(GameStateResponse {
            game_id: game_id.to_string(),
            state: game.into(),
            status: GameStatusDto::from(game.status()),
        })
    }

    // Deshace el último movimiento
    // Devuelve el estado anterior o error si no hay movimientos que deshacer
    pub fn undo_move(&self, game_id: &str) -> Result<GameStateResponse, GameServiceError> {
        let mut games = self.games.lock().unwrap();
        let history = games
            .get_mut(game_id)
            .ok_or_else(|| GameServiceError::GameNotFound(game_id.to_string()))?;

        if history.len() <= 1 {
            return Err(GameServiceError::GameError("No hay movimientos para deshacer".to_string()));
        }
        history.pop();

        let game = history.last().unwrap();
        Ok(GameStateResponse {
            game_id: game_id.to_string(),
            state: game.into(),
            status: GameStatusDto::from(game.status()),
        })
    }

    // Devuelve el status de un game ID
    pub fn get_status(&self, game_id: &str) -> Option<GameStatusDto> {
        let games = self.games.lock().unwrap();
        games.get(game_id).and_then(|h| h.last())
            .map(|game| GameStatusDto::from(game.status()))
    }

    // Devuelve todos los id de partidas activas
    pub fn list_games(&self) -> Vec<GameId> {
        self.games.lock().unwrap().keys().cloned().collect()
    }

    // Borra un juego por id
    // Devuelve si lo elimino
    pub fn delete_game(&self, game_id: &str) -> bool {
        self.games.lock().unwrap().remove(game_id).is_some()
    }
}

