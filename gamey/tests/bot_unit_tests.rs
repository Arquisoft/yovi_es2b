use gamey::{
    Coordinates, DefensiveBot, GameY, MonteCarloBot, MonteCarloEndurecidoBot,
    MonteCarloEndurecidoConcursoBot, MonteCarloMejoradoBot, Movement, OffensiveBot, PlayerId,
    RandomBot, YBot,
};

// ============================================================================
// Helpers compartidos para evitar duplicacion entre bots
// ============================================================================

fn tablero_lleno() -> GameY {
    let mut game = GameY::new(2);
    let moves = vec![
        Movement::Placement { player: PlayerId::new(0), coords: Coordinates::new(1, 0, 0) },
        Movement::Placement { player: PlayerId::new(1), coords: Coordinates::new(0, 1, 0) },
        Movement::Placement { player: PlayerId::new(0), coords: Coordinates::new(0, 0, 1) },
    ];
    for mv in moves {
        game.add_move(mv).unwrap();
    }
    game
}

fn comprueba_bot(bot: &dyn YBot, nombre: &str) {
    assert_eq!(bot.name(), nombre);

    // Devuelve movimiento en tablero vacio
    let game = GameY::new(5);
    assert!(bot.choose_move(&game).is_some());

    // Coordenadas validas (size 5 => 15 casillas)
    let coords = bot.choose_move(&game).unwrap();
    assert!(coords.to_index(game.board_size()) < 15);

    // None en tablero lleno
    assert!(bot.choose_move(&tablero_lleno()).is_none());

    // Elige de casillas disponibles
    let mut game3 = GameY::new(3);
    game3.add_move(Movement::Placement {
        player: PlayerId::new(0),
        coords: Coordinates::new(2, 0, 0),
    }).unwrap();
    let idx = bot.choose_move(&game3).unwrap().to_index(game3.board_size());
    assert!(game3.available_cells().contains(&idx));
}

// ============================================================================
// Tests por bot
// ============================================================================

#[test]
fn test_random_bot() {
    comprueba_bot(&RandomBot, "random_bot");
}

#[test]
fn test_defensive_bot() {
    comprueba_bot(&DefensiveBot, "defensive_bot");
}

#[test]
fn test_offensive_bot() {
    comprueba_bot(&OffensiveBot, "offensive_bot");
}

#[test]
fn test_montecarlo_bot() {
    comprueba_bot(&MonteCarloBot, "montecarlo_bot");
}

#[test]
fn test_montecarlo_mejorado_bot() {
    comprueba_bot(&MonteCarloMejoradoBot, "montecarlo_mejorado_bot");
}

#[test]
fn test_montecarlo_endurecido_bot() {
    comprueba_bot(&MonteCarloEndurecidoBot, "montecarlo_endurecido_bot");
}

#[test]
fn test_montecarlo_endurecido_concurso_bot() {
    comprueba_bot(&MonteCarloEndurecidoConcursoBot, "montecarlo_endurecido_concurso_bot");
}