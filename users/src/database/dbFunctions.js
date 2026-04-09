const e = require('express');
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

    //
    if(username.trim() !== username) {
        throw new InvalidCredentialsError();
    }

    // espera a encontrar el usuario en la base -> Jimena maneja la base
    const existingUser = await users.findOne({ "username": String(username) });
    // si el usuario no existe
    if (!existingUser) {
        throw new UserNotFoundError(username);
    }
    // si la contraseña es incorrecta
    if (existingUser.password !== password) {
        throw new InvalidCredentialsError();
    }

    // esta correcto
    return 'Usuario encontrado exitosamente. Iniciando sesión...' ;
}

/**
 * Función de creación de usuario
 */
async function createuser(users, username, password) {
    username = username.trim();

    // que no sea usuario vacío 
    if (!username || typeof username !== 'string' || username.length === 0) {
        throw new MissingFieldsError(['username']);
    }
    // que no sea contraseña vacía
    if (!password || typeof password !== 'string') {
        throw new MissingFieldsError(['password']);
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": String(username) });
    if (existingUser) {
        throw new UserAlreadyExistsError(username);
    }

    // comprueba una contraseña correcta
    checkPassword(password);

    // espera a crear el usuario en la base -> Jimena maneja la base
    await users.insertOne({ username: String(username), password: String(password), createdAt: new Date() });

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
        return;
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": String(username) });
    if (existingUser) {
        // espera a eliminar el usuario en la base -> Jimena maneja la base
        await users.deleteOne({ "username": String(username) });
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
    const existingUser = await users.findOne({ "username": String(username) });

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
        throw new WeakPasswordError('La contraseña debe tener 5 o más caracteres.');
    }

    // contraseña tiene una minúscula
    if (!password.match(/[a-z]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos una minúscula.');
    }

    // contraseña tiene una mayúscula
    if (!password.match(/[A-Z]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos una mayúscula.');
    }

    // contraseña tiene un número
    if (!password.match(/[0-9]/)) {
        throw new WeakPasswordError('La contraseña debe contener al menos un número.');
    }
}

    /**
     * Función de creación de partida
     */
    async function initmatch(users, username, strategy, difficulty) {

        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": String(username) });
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
        const existingUser = await users.findOne({ "username": String(username) });
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
        const existingUser = await users.findOne({ "username": String(username) });
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
                perdidas: Math.max(totalPartidas - totalWins, 0),
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
        const existingUser = await users.findOne({ "username": String(username) });
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
                perdidas: Math.max(totalPartidas - totalWins, 0),
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
        const existingUser = await users.findOne({ "username": String(username) });
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
                    perdidas: Math.max(partidas - wins, 0),
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
            perdidas: Math.max((pt || 0) - (ptw || 0), 0),
            ganadas: ptw || 0,
            porcentaje: pt ? ((ptw / pt) * 100).toFixed(2) + ' %' : '0.00 %'
        });

        return stats;
    }

    /**
     * Ranking global por porcentaje de victorias.
     */
    async function rankingvictories(users) {
        const allUsers = await users.find({}).toArray();
        const ranking = [];

        for (const u of allUsers) {
            let wins = 0;
            let jugadasTotal = 0;
            for (const diff of difs) {
                for (const strat of strats) {
                    const jugadas = u[`${diff}${strat}`] || 0;
                    const ganadas = u[`${diff}${strat}Wins`] || 0;
                    wins         += ganadas;
                    jugadasTotal += jugadas;
                }
            }

            const total = jugadasTotal;
            const pct = total > 0 ? Number(((wins / total) * 100).toFixed(2)) : 0;
 
            ranking.push({
                username: u.username,
                value: wins,
                percentage: pct
            });
        }

        // Ordenamos de mayor a menor porcentaje de victorias
        ranking.sort((a, b) => b.value - a.value);
        return ranking;
    }

    /**
     * Ranking global por porcentaje de derrotas.
     */
    async function rankingdefeats(users) {
        const allUsers = await users.find({}).toArray();
        const ranking = [];

        for (const u of allUsers) {
            const totales = u.totales || 0;
            const wins = u.totalesWins || 0;
            const derrotas = Math.max(totales - wins, 0);
            const porcentaje = totales > 0 ? Number(((derrotas / totales) * 100).toFixed(2)) : 0;

            ranking.push({
                username: u.username,
                value: derrotas,
                percentage: porcentaje
            });
        }

        ranking.sort((a, b) => b.value - a.value);
        return ranking;
    }

    /**
     * Ranking de porcentaje de victorias para una dificultad concreta.
     */
    async function rankingwinsbydifficulty(users, difficulty) {
        if (!difs.includes(difficulty)) {
            throw new InvalidDifficultyError(difficulty);
        }

        const allUsers = await users.find({}).toArray();
        const ranking = [];

        for (const u of allUsers) {
            let wins = 0;
            let partidas = 0;
            for (const strat of strats) {
                wins += u[`${difficulty}${strat}Wins`] || 0;
                partidas += u[`${difficulty}${strat}`] || 0;
            }
            const porcentaje = partidas > 0 ? Number(((wins / partidas) * 100).toFixed(2)) : 0;


            ranking.push({
                username: u.username,
                value: wins,
                percentage: porcentaje
            });
        }

        ranking.sort((a, b) => b.value - a.value);
        return ranking;
    }

    /**
     * Ranking de porcentaje de victorias para una estrategia concreta.
     */
    async function rankingwinsbystrategy(users, strategy) {
        if (!strats.includes(strategy)) {
            throw new InvalidStrategyError(strategy);
        }

        const allUsers = await users.find({}).toArray();
        const ranking = [];

        for (const u of allUsers) {
            let wins = 0;
            let partidas = 0;
            for (const diff of difs) {
                wins += u[`${diff}${strategy}Wins`] || 0;
                partidas += u[`${diff}${strategy}`] || 0;
            }
            const porcentaje = partidas > 0 ? Number(((wins / partidas) * 100).toFixed(2)) : 0;

            ranking.push({
                username: u.username,
                value: wins,
                percentage: porcentaje
            });
        }

        ranking.sort((a, b) => b.value - a.value);
        return ranking;
    }

module.exports = {
    loginuser, createuser, deleteuser, findUser,
    initmatch, endmatch,
    diffstats, stratstats, allstats,
    rankingvictories, rankingdefeats, rankingwinsbydifficulty, rankingwinsbystrategy
};
