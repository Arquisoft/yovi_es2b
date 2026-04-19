Feature: Registrar, cerrar sesión e iniciar sesión
  Validar que un usuario puede registrarse, cerrar sesión y volver a iniciar sesión

  Scenario: Registrar un nuevo usuario, cerrar sesión y volver a iniciar sesión
    Given la página de registro está abierta
    When registro un nuevo usuario y guardo las credenciales
    Then debería ver la pantalla principal
    When hago clic en cerrar sesión
    Then debería ver la página de inicio de sesión
    When inicio sesión con las credenciales guardadas
    Then debería ver la pantalla principal
