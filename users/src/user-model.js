
/**
 * Modelo de Usuario.
 * Define la estructura de un usuario en el sistema, pero no implementa lógica de negocio.
 * Este archivo se encarga de definir cómo es un usuario, qué atributos tiene, pero no se encarga de manejar endpoints ni lógica de negocio.
 */

class User {
  /**
   * Constructor de la clase User, que define los atributos de un usuario.
   * @param {string} username - Nombre de usuario único
   * @param {string} password - Contraseña (idealmente ya hasheada antes de llegar aquí)
   * @param {Date}   createdAt - Fecha de creación (por defecto, ahora)
   * @param {Object} stats     - Estadísticas de partidas del usuario
   */
  constructor(username, password, createdAt = new Date(), stats = { gamesPlayed: 0, wins: 0, losses: 0 }) {
    this.username  = username;
    this.password  = password;
    this.createdAt = createdAt;
    this.stats     = stats;
  }
}

//Module exports es una forma de exportar un módulo en Node.js, lo que permite que otras partes de la aplicación puedan importar y utilizar la clase UserService definida en este archivo.
module.exports = User;