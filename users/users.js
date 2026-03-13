
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
const { loginuser, createuser } = require('./dbFunctions');
//Busca las funciones loginuser y createuser en el archivo dbFunctions.js y las importa para que puedan ser utilizadas en esta clase UserService.

class UserService {
    // El constructor es donde se define el "atributo"
    constructor(db) {
        this.db = db; 
        this.usersCollection = db.collection("users"); // La colección de usuarios en la base de datos
    }

/**
 * Este método maneja la lógica de inicio de sesión de un usuario.
 * Llama a la función loginuser para verificar las credenciales del usuario en la base de datos.
 * Si el inicio de sesión es exitoso, devuelve un mensaje de bienvenida personalizado.
 * Se usa async porque interactuamos con la BD, una operación asíncrona (porque puede tardar un tiempo en completarse, hay que esperar una respuesta).
 * Esto permite que el código espere a que la operación de inicio de sesión se complete antes de continuar con la ejecución.
 * El await se usa para esperar a la respuesta de loginuser. Hasta que no se devuelva una respuesta, el código no continuará ejecutándose. 
 * @param {*} password, parametro para la contraseña del usuario que se va a iniciar sesión.
 * @returns Un mensaje de bienvenida personalizado si el inicio de sesión es exitoso.
 */
  async loginUserLogic(username, password) {
        await loginuser(this.usersCollection, username, password);
        return `Hello ${username}! welcome back!`;
    }
  
/**
 * Esta función maneja la lógica de creación de un nuevo usuario.
 * Llama a la función createuser para crear un nuevo usuario en la base de datos.
 * Si la creación es exitosa, devuelve un mensaje de bienvenida personalizado.
 * @param {*} username, parametro para el nombre de usuario que se va a crear.
 * @param {*} password, parametro para la contraseña del usuario que se va a crear.
 * @returns Un mensaje de bienvenida personalizado si la creación es exitosa.
 */
  async createUserLogic(username, password) {
    await createuser(this.usersCollection, username, password);
    return `Hello ${username}! welcome to the course!`;
  }
}

//Module exports es una forma de exportar un módulo en Node.js, lo que permite que otras partes de la aplicación puedan importar y utilizar la clase UserService definida en este archivo.
module.exports = UserService;
