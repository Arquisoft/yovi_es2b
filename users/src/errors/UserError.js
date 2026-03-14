/**
 * Tipo de error personalizado para el dominio de usuarios.
 * Permite distinguir en el controlador si el error viene de una regla de negocio (UserError) o de un fallo inesperado del sistema (Error genérico).
 */

class UserError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código HTTP asociado (400, 401, 404, 409...)
   */
  constructor(message, statusCode) {
    super(message);        // llama al constructor de Error con el mensaje
    this.name = 'UserError';
    this.statusCode = statusCode;
  }
}

module.exports = UserError;