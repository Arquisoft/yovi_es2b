
/**
 * Esta clase contiene la lógica de negocio para manejar los usuarios en la aplicación. 
 * Aquí se definen funciones para crear, leer, actualizar y eliminar usuarios (toda la gestion de usuarios en la base de datos),
 * Este archivo no se encarga de manejar endpoints, solo implementa los metodos que luego serán llamados por los endpoints definidos en users.js
 */

/**
 * Importamos las funciones necesarias para interactuar con la base de datos y manejar la lógica de usuarios.
 * Estas funciones se encuentran en el archivo dbFunctions.js, que contiene la lógica específica para interactuar con la base de datos 
 * Requiere es una función de Node.js que se utiliza para importar módulos o archivos en el código. 
 * En este caso, estamos importando las funciones loginuser y createuser desde el archivo dbFunctions.js, necesarias para el inicio de sesión
 */
const { loginuser, createuser, findUser, initmatch, endmatch } = require('./database/dbFunctions');
//Busca las funciones loginuser y createuser en el archivo dbFunctions.js y las importa para que puedan ser utilizadas en esta clase UserService.

class UserService {

   /**
   * Constructor de la clase UserService, que recibe una instancia de la base de datos para poder interactuar con ella.
   * @param {Object} db - Instancia de MongoDB inyectada desde el entry point
   */
  constructor(db) {
    this.usersCollection = db.collection('users'); 
    //En MongoDB, una colección es un grupo de documentos (similar a una tabla en bases de datos relacionales).
  }

/**
 * Este método maneja la lógica de inicio de sesión de un usuario.
 * Llama a la función loginuser para verificar las credenciales del usuario en la base de datos.
 * Si el inicio de sesión es exitoso, devuelve un mensaje de bienvenida personalizado.
 * Se usa async porque interactuamos con la BD, una operación asíncrona (porque puede tardar un tiempo en completarse, hay que esperar una respuesta).
 * Esto permite que el código espere a que la operación de inicio de sesión se complete antes de continuar con la ejecución.
 * El await se usa para esperar a la respuesta de loginuser. Hasta que no se devuelva una respuesta, el código no continuará ejecutándose. 
 * @param {string} username
  * @param {string} password
  * @returns {string} Mensaje de bienvenida si las credenciales son correctas.
  * @throws {Error} Relanzado desde dbFunctions si las credenciales son incorrectas
 */
  async loginUser(username, password) {
        await loginuser(this.usersCollection, username, password);
        return `Hello ${username}! welcome back!`;
    }
  
/**
 * Esta función maneja la lógica de creación de un nuevo usuario.
 * Llama a la función createuser para crear un nuevo usuario en la base de datos.
 * Si la creación es exitosa, devuelve un mensaje de bienvenida personalizado.
 * 
 * Nos aseguramos de que la entrada es adecuada (que el nombre de usuario y la contraseña no estén vacíos y sean del tipo correcto) antes de intentar crear el usuario en la base de datos.
 * Si el usuario ya existe o si la contraseña no cumple con los requisitos, se lanzarán errores 
 * 
 * @param {*} username, parametro para el nombre de usuario que se va a crear.
 * @param {*} password, parametro para la contraseña del usuario que se va a crear.
 * @returns Un mensaje de bienvenida personalizado si la creación es exitosa.
 */
  async createUser(username, password) {
    const normalizedUsername = username.trim();
    await createuser(this.usersCollection, normalizedUsername, password);
    return `Hello ${normalizedUsername}! welcome to the course!`;
  }

   /**
   * Busca un usuario por username.
   * Usado por GET /users/:id y por gamey para verificar existencia.
   * Nunca devuelve la contraseña — se filtra aquí antes de salir del servicio.
   *
   * @param {string} username
   * @returns {Promise<Object>} Usuario sin el campo password
   * @throws {Error} Si el usuario no existe
   */
  async getUser(username) {
    const user = await findUser(this.usersCollection, username);      
    // Separamos la password del resto — nunca la devolvemos hacia fuera
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
    }

  /**
   * Para la creación de una partida, se necesita verificar que el usuario existe y luego iniciar la partida con los parámetros dados.
   * Llama a la función initmatch para iniciar una nueva partida en la base de datos.
   * Si la partida se inicia correctamente, devuelve un mensaje indicando que la partida ha comenzado.
   * 
   * @param {*} username 
   * @param {*} strategy 
   * @param {*} difficulty 
   * @returns 
   */
  async initmatch(username, strategy, difficulty) {
    await initmatch(this.usersCollection, username, strategy, difficulty);
    return `Match started for ${username}!`;
  }

  /**
   * Para la terminación de una partida ganada, se necesita verificar que el usuario existe y luego iniciar la partida con los parámetros dados.
   * Llama a la función endmatch para terminar una partida ganada en la base de datos.
   * Si la partida se termina correctamente, devuelve un mensaje indicando que la partida ha terminado y has ganado.
   * 
   * @param {*} username 
   * @param {*} strategy 
   * @param {*} difficulty 
   * @returns 
   */
  async endmatch(username, strategy, difficulty) {
    await endmatch(this.usersCollection, username, strategy, difficulty);
    return `Match ended for ${username}! You won!`;
  }

  async diffstats(username) {
    const stats = await diffstats(this.usersCollection, username);
    return stats;
  }
}

//Module exports es una forma de exportar un módulo en Node.js, lo que permite que otras partes de la aplicación puedan importar y utilizar la clase UserService definida en este archivo.
module.exports = UserService;
