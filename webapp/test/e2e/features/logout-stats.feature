Feature: Cerrar sesión desde las pantallas de estadísticas
  Validar que el botón de cerrar sesión funciona correctamente en todas las pantallas de estadísticas

  Scenario: Cerrar sesión desde el menú de estadísticas
    Given la página de registro está abierta
    When registro un nuevo usuario y guardo las credenciales
    Then debería ver la pantalla principal
    When navego a mis estadísticas
    Then debería ver la pantalla de estadísticas
    When hago clic en cerrar sesión
    Then debería ver la página de inicio de sesión

  Scenario: Cerrar sesión desde la pantalla de todas las estadísticas
    Given la página de registro está abierta
    When registro un nuevo usuario y guardo las credenciales
    Then debería ver la pantalla principal
    When navego a mis estadísticas
    Then debería ver la pantalla de estadísticas
    When navego a todas las estadísticas
    Then debería ver la pantalla de todas las estadísticas
    When hago clic en cerrar sesión
    Then debería ver la página de inicio de sesión

  Scenario: Cerrar sesión desde la pantalla de estadísticas filtradas
    Given la página de registro está abierta
    When registro un nuevo usuario y guardo las credenciales
    Then debería ver la pantalla principal
    When navego a mis estadísticas
    Then debería ver la pantalla de estadísticas
    When navego a las estadísticas filtradas
    Then debería ver la pantalla de estadísticas filtradas
    When hago clic en cerrar sesión
    Then debería ver la página de inicio de sesión