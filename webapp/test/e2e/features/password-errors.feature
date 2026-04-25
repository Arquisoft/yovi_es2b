Feature: Errores al poner una contraseña mal en el registro
  Comprobar que cuando pones una contraseña que no cumple los requisitos te sale el mensaje de error correcto

  Scenario Outline: Sale el error correcto segun la contraseña que pongas
    Given la página de registro está abierta
    And estoy en el formulario de registro
    When intento registrarme con la contraseña "<contraseña>"
    Then debería ver el mensaje de error "<mensaje>"

    Examples:
      | contraseña | mensaje                                             |
      | abc        | La contraseña debe tener 5 o más caracteres.        |
      | abcde      | La contraseña debe contener al menos una mayúscula. |
      | ABCDE      | La contraseña debe contener al menos una minúscula. |
      | abcDE      | La contraseña debe contener al menos un número.     |