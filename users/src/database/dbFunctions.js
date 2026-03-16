const UserError = require('../errors/UserError');

/*
 * Función de registro de un usuario existente
 */
async function loginuser(users, username, password) {

    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new UserError('Ususario inválido', 404);
    }
    if (!password || typeof password !== 'string') {
        throw new UserError('Contraseña inválida', 404);
    }

    // espera a encontrar el usuario en la base -> Jimena maneja la base
    const existingUser = await users.findOne({ "username": username });
    // si el usuario no existe
    if (!existingUser) {
        throw new UserError('Usuario incorrecto. Prueba con otro o regístrate.', 404);
    }
    // si la contraseña es incorrecta
    if (existingUser.password !== password) {
        throw new UserError('Contraseña incorrecta. Inténtalo de nuevo.', 404);
    }

    // todo bien
    return 'Usuario encontrado exitosamente. Iniciando sesión...' ;
}

/**
 * Función de creación de usuario
 */
async function createuser(users, username, password) {
    // que no sea usuario vacío 
    if (!username || typeof username !== 'string') {
        throw new UserError('Ususario inválido', 404);
    }
    // que no sea contraseña vacía
    if (!password || typeof password !== 'string') {
        throw new UserError('Contraseña inválida', 404);
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": username });
    if (existingUser) {
        throw new UserError('Ese usuario ya existe. Prueba con otro o inicie sesión.', 404);
    }

    // comprueba una contraseña correcta
    checkPassword(password);

    // espera a crear el usuario en la base -> Jimena maneja la base
    await users.insertOne({ username, password, createdAt: new Date() });

    // todo bien
    return 'Usuario creado exitosamente. Iniciando sesión...' ;
}

/**
 * Busca un usuario por su nombre de usuario
 * @throws {UserError} Si el usuario no existe, se lanza un error con un mensaje descriptivo.
 */
async function findUser(users, username) {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new UserError('Usuario inválido', 404);
    }
    const existingUser = await users.findOne({ "username": username });

    if (existingUser == null) {
        throw new UserError(`Usuario '${username}' no encontrado`, 404);
        //404 Not Found es un código de estado HTTP que indica que el recurso solicitado no se ha encontrado en el servidor.
    }
    return existingUser; //no lanza error si no encuentra el usuario, simplemente devuelve null
}

/**
 * Comprueba que una contraseña sea correcta
 * en la creación del usuario
 */
function checkPassword(password) {
    // contraseña de más de 5 caracteres
    if (password.length < 5) {
        throw new Error('La contraseña debe tener 6 o más caracteres.');
    }

    // contraseña tiene una minúscula
    if (!password.match(/[a-z]/)) {
        throw new Error('La contraseña debe contener al menos una minúscula');
    }

    // contraseña tiene una mayúscula
    if (!password.match(/[A-Z]/)) {
        throw new Error('La contraseña debe contener al menos una mayúscula');
    }

    // contraseña tiene un número
    if (!password.match(/[0-9]/)) {
        throw new Error('La contraseña debe contener al menos un número');
    }
}


    /**
     * Función de creación de partida
     */
    async function initmatch(users, username, strategy, difficulty) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }

        var estrategiaJuego = "estrategia" + strategy;
        var dificultadJuego = "dificultad" + difficulty;

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    partidasTotales: 1,
                    [estrategiaJuego]: 1,
                    [dificultadJuego]: 1
                }
            }
        )
        // es correcto
        return 'Partida creada correctamente' ;
    }

    /**
     * Función de terminación de partida ganada
     */
    async function endmatch(users, username, strategy, difficulty) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }

        var estrategiaJuego = "estrategia" + strategy + "Wins";
        var dificultadJuego = "dificultad" + difficulty + "Wins";

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    partidasTotalesWins: 1,
                    [estrategiaJuego]: 1,
                    [dificultadJuego]: 1
                }
            }
        )
        // es correcto
        return 'Partida terminada y ganada correctamente' ;
    }




module.exports = { loginuser, createuser, findUser, initmatch, endmatch };