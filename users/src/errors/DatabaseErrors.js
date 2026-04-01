/**
 * Tipo de error personalizado para el problemas de la base de datos
 */

class DatabaseError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   */
  constructor(message) {
    super(message);        // llama al constructor de Error con el mensaje
    this.name = 'DatabaseError';
  }
}

module.exports = DatabaseError;