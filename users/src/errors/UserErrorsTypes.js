/**
 * Archivo para definir los tipos de errores específicos relacionados con los usuarios.
 * Cada error extiende de UserError y permite especificar un mensaje y un código de estado HTTP asociado.
 * Esto facilita el manejo de errores con mensajes especificos y mayor personalización en el controlador.
 * El principal beneficio es para los test unitarios, ya que pueden verificar que se lanza el error correcto con el mensaje esperado, en lugar de depender de mensajes genéricos o códigos de estado.
 */

const UserError = require('./UserError');

// 400 — faltan campos o formato incorrecto
class InvalidStrategyError extends UserError {
    constructor(strategy) {
        super(`La estrategia '${strategy}' no es válida.`, 406);
    }
}

class InvalidDifficultyError extends UserError {
    constructor(difficulty) {
        super(`La dificultad '${difficulty}' no es válida.`, 405);
    }
}

class MissingFieldsError extends UserError {
    constructor(fields) {
        super(`Faltan campos por rellenar.`, 403);
    }
}


class WeakPasswordError extends UserError {
    constructor(mensaje) {
        super(mensaje, 402);
    }
}

// 401 — credenciales incorrectas (el usuario existe pero la contraseña no)
class InvalidCredentialsError extends UserError {
    constructor() {
        super('Usuario o contraseña incorrectos. Inténtalo de nuevo.', 401);
    }
}

// 404 — usuario no encontrado 
class UserNotFoundError extends UserError {
    constructor(username) {
        super(`El usuario '${username}' no existe. Prueba de nuevo o regístrate.`, 408);
    }
}

// 409 — conflicto el usuario ya existe
class UserAlreadyExistsError extends UserError {
    constructor(username) {
        super(`El usuario '${username}' ya existe. Prueba con otro nombre de usuario.`, 409);
    }
}

module.exports = {
    InvalidCredentialsError,
    MissingFieldsError,
    UserNotFoundError,
    UserAlreadyExistsError,
    WeakPasswordError,
    InvalidStrategyError,
    InvalidDifficultyError,
};