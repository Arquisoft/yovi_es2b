const e = require('express');
const UserError = require('../errors/UserError');
const {
    InvalidCredentialsError,
    MissingFieldsError,
    UserNotFoundError,
    UserAlreadyExistsError,
    WeakPasswordError,
    InvalidStrategyError,
    InvalidDifficultyError,
} = require('../errors/UserErrorsTypes');

    const difs = ["EASY", "MEDIUM", "HARD"];
    const strats = ["RANDOM", "DEFENSIVO", "OFENSIVO", "MONTE_CARLO", "MONTE_CARLO_MEJORADO", "MONTE_CARLO_ENDURECIDO"];


/*
 * Función de registro de un usuario existente
 */
async function loginuser(users, username, password) {

    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new MissingFieldsError(['username']);
    }
    if (!password || typeof password !== 'string') {
        throw new MissingFieldsError(['password']);
    }

    // espera a encontrar el usuario en la base -> Jimena maneja la base
    const existingUser = await users.findOne({ "username": username });
    // si el usuario no existe
    if (!existingUser) {
        throw new UserNotFoundError(username);
    }
    // si la contraseña es incorrecta
    if (existingUser.password !== password) {
        throw new InvalidCredentialsError();
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
        throw new MissingFieldsError(['username']);
    }
    // que no sea contraseña vacía
    if (!password || typeof password !== 'string') {
        throw new MissingFieldsError(['password']);
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": username });
    if (existingUser) {
        throw new UserAlreadyExistsError(username);
    }

    // comprueba una contraseña correcta
    checkPassword(password);

    // espera a crear el usuario en la base -> Jimena maneja la base
    await users.insertOne({ username, password, createdAt: new Date() });

    // esta correcto
    return 'Usuario creado exitosamente. Iniciando sesión...' ;
}

/**
 * Función de eliminar usuario
 * Para test
 */
async function deleteuser(users, username) {
    // que no sea usuario vacío 
    if (!username || typeof username !== 'string') {
        throw new MissingFieldsError(['username']);
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": username });
    if (existingUser) {
        // espera a eliminar el usuario en la base -> Jimena maneja la base
        await users.deleteOne({ "username": username });
    }

    // esta correcto
    return 'Usuario eliminado exitosamente.' ;
}

/**
 * Busca un usuario por su nombre de usuario
 * @throws {UserError} Si el usuario no existe, se lanza un error con un mensaje descriptivo.
 */
async function findUser(users, username) {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new MissingFieldsError(['username']);
    }
    const existingUser = await users.findOne({ "username": username });

    if (existingUser == null) {
        throw new UserNotFoundError(username);
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
        throw new WeakPasswordError('La contraseña debe tener 6 o más caracteres.');
    }

    // contraseña tiene una minúscula
    if (!password.match(/[a-z]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos una minúscula');
    }

    // contraseña tiene una mayúscula
    if (!password.match(/[A-Z]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos una mayúscula');
    }

    // contraseña tiene un número
    if (!password.match(/[0-9]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos un número');
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
            throw new UserNotFoundError(username);
        }

        if (!strats.includes(strategy)) {
            throw new InvalidStrategyError(strategy);
        }
        if (!difs.includes(difficulty)) {
            throw new InvalidDifficultyError(difficulty);
        }

        var partidasGeneral = difficulty + strategy;

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    totales: 1,
                    [partidasGeneral]: 1
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
        // si el usuario no existe. Habla con Jimena
        if (!existingUser) {
            throw new UserNotFoundError(username);
        }

        if (!strats.includes(strategy)) {
            throw new InvalidStrategyError(strategy);
        }
        if (!difs.includes(difficulty)) {
            throw new InvalidDifficultyError(difficulty);
        }

        var partidasGeneral = difficulty + strategy + "Wins";

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    totalesWins: 1,
                    [partidasGeneral]: 1
                }
            }
        )
        // es correcto
        return 'Partida terminada y ganada correctamente' ;
    }

    /**
     * Función de calculo de estadisticas segun la dificultad
     */
    async function diffstats(users, username) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe. Habla con Jimena
        if (!existingUser) {
            throw new UserNotFoundError(username);
        }

        const stats = [];
        
        for (const diff of difs) {

            let totalPartidas = 0;
            let totalWins = 0;

            for (const strat of strats) {
                totalPartidas += existingUser[`${diff}${strat}`] || 0;
                totalWins += existingUser[`${diff}${strat}Wins`] || 0;
            }

            stats.push({
                dificultad: diff,
                jugadas: totalPartidas,
                perdidas: totalPartidas - totalWins,
                ganadas: totalWins,
                porcentaje: totalPartidas ? ((totalWins / totalPartidas) * 100).toFixed(2) + ' %' : '0.00 %'
            });
        }

        return stats;
    }

    /**
     * Función de calculo de estadisticas segun la estrategia
     */
    async function stratstats(users, username) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe. Habla con Jimena
        if (!existingUser) {
            throw new UserNotFoundError(username);
        }

        const stats = [];
        
        for (const strat of strats) {

            let totalPartidas = 0;
            let totalWins = 0;

            for (const diff of difs) {
                totalPartidas += existingUser[`${diff}${strat}`] || 0;
                totalWins += existingUser[`${diff}${strat}Wins`] || 0;
            }

            stats.push({
                estrategia: strat,
                jugadas: totalPartidas || 0,
                perdidas: totalPartidas - totalWins || 0,
                ganadas: totalWins || 0,
                porcentaje: totalPartidas ? ((totalWins / totalPartidas) * 100).toFixed(2) + ' %' : '0.00 %'
            });
        }

        return stats;
    }

    /**
     * Función de calculo de estadisticas segun la dificultad
     */
    async function allstats(users, username) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe. Habla con Jimena
        if (!existingUser) {
            throw new UserNotFoundError(username);
        }
        
        const stats = [];

        for (const diff of difs) {
            for (const strat of strats) {

                const partidas = existingUser[`${diff}${strat}`] || 0;
                const wins = existingUser[`${diff}${strat}Wins`] || 0;

                stats.push({
                    dificultad: diff,
                    estrategia: strat,
                    jugadas: partidas,
                    perdidas: partidas - wins,
                    ganadas: wins,
                    porcentaje: partidas ? ((wins / partidas) * 100).toFixed(2) + ' %' : '0.00 %'
                });
            }
        }

        const pt = existingUser.totales;
        const ptw = existingUser.totalesWins;

        stats.push({
            dificultad: "",
            estrategia: "TOTALES",
            jugadas: pt || 0,
            perdidas: pt - ptw || 0,
            ganadas: ptw || 0,
            porcentaje: pt ? ((ptw / pt) * 100).toFixed(2) + ' %' : '0.00 %'
        });

        return stats;
    }

module.exports = { loginuser, createuser, deleteuser, findUser, initmatch, endmatch, diffstats, stratstats, allstats };