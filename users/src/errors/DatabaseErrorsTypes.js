/**
 * Archivo para definir los tipos de errores específicos relacionados con la base de datos.
 * Cada error extiende de DatabaseError y permite especificar un mensaje y un código de estado HTTP asociado.
 * Esto facilita el manejo de errores con mensajes especificos y mayor personalización en el controlador.
 * El principal beneficio es para los test unitarios, ya que pueden verificar que se lanza el error correcto con el mensaje esperado, en lugar de depender de mensajes genéricos o códigos de estado.
 */

const DatabaseError = require('./DatabaseError');


class InvalidDBDefinition extends DatabaseError {
    constructor(difficulty) {
        super("MONGO_URI mal definida -> Habla con Jimena");
    }
}

class MissingDB extends DatabaseError {
    constructor(fields) {
        super("Base de datos inexistente -> Habla con Jimena");
    }
}