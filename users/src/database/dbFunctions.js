const e = require('express');
const UserError = require('../errors/UserError');

/*
 * Función de registro de un usuario existente
 */
async function loginuser(users, username, password) {

    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new UserError('Usuario inválido', 404);
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
        var partidasGeneral = "partida" + difficulty + strategy;

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    partidasTotales: 1,
                    [estrategiaJuego]: 1,
                    [dificultadJuego]: 1,
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
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }

        var estrategiaJuego = "estrategia" + strategy + "Wins";
        var dificultadJuego = "dificultad" + difficulty + "Wins";
        var partidasGeneral = "partida" + difficulty + strategy + "Wins";

        await users.updateOne(
            { _id: existingUser._id },
            {
                $inc: {
                    partidasTotalesWins: 1,
                    [estrategiaJuego]: 1,
                    [dificultadJuego]: 1,
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
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }
        
        const de=existingUser.dificultadEASY;
        const dew=existingUser.dificultadEASYWins;
        const dm=existingUser.dificultadMEDIUM;
        const dmw=existingUser.dificultadMEDIUMWins;
        const dh=existingUser.dificultadHARD;
        const dhw=existingUser.dificultadHARDWins;

        const stats = [
        {
            dificultad: "FÁCIL",
            jugadas: de || 0,
            perdidas: de - (dew || 0) || 0,
            ganadas: dew || 0,
            porcentaje: de ? ((dew || 0) / de * 100).toFixed(2) : '0.00 %'
        },
        {
            dificultad: "MEDIA",
            jugadas: dm || 0,
            perdidas: dm - (dmw || 0) || 0,
            ganadas: dmw || 0,
            porcentaje: dm ? ((dmw || 0) / dm * 100).toFixed(2) : '0.00 %'
        },
        {
            dificultad: "DIFÍCIL",
            jugadas: dh || 0,
            perdidas: dh - (dhw || 0) || 0,
            ganadas: dhw || 0,
            porcentaje: dh ? ((dhw || 0) / dh * 100).toFixed(2) : '0.00 %'
        },
        {
            dificultad: "TOTALES",
            jugadas: de+dm+dh || 0,
            perdidas: (de+dm+dh) - (dew+dmw+dhw || 0) || 0,
            ganadas: dew+dmw+dhw || 0,
            porcentaje: (de+dm+dh) ? (((dew+dmw+dhw || 0)) / (de+dm+dh) * 100).toFixed(2) : '0.00 %'
        }
        ];

        return stats;
    }

    /**
     * Función de calculo de estadisticas segun la estrategia
     */
    async function stratstats(users, username) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }
        
        const er=existingUser.estrategiaRANDOM;
        const erw=existingUser.estrategiaRANDOMWins;
        const ed=existingUser.estrategiaDEFENSIVE;
        const edw=existingUser.estrategiaDEFENSIVEWins;
        const eo=existingUser.estrategiaOFFENSIVE;
        const eow=existingUser.estrategiaOFFENSIVEWins;
        const ecf=existingUser.estrategiaCENTER_FIRST;
        const ecfw=existingUser.estrategiaCENTER_FIRSTWins;
        const eef=existingUser.estrategiaEDGE_FIRST;
        const eefw=existingUser.estrategiaEDGE_FIRSTWins;

        const stats = [
        {
            estrategia: "RANDOM",
            jugadas: er || 0,
            perdidas: er - (erw || 0) || 0,
            ganadas: erw || 0,
            porcentaje: er ? ((erw || 0) / er * 100).toFixed(2) : '0.00 %'
        },
        {
            estrategia: "DEFENSIVE",
            jugadas: ed || 0,
            perdidas: ed - (edw || 0) || 0,
            ganadas: edw || 0,
            porcentaje: ed ? ((edw || 0) / ed * 100).toFixed(2) : '0.00 %'
        },
        {
            estrategia: "OFFENSIVE",
            jugadas: eo || 0,
            perdidas: eo - (eow || 0) || 0,
            ganadas: eow || 0,
            porcentaje: eo ? ((eow || 0) / eo * 100).toFixed(2) : '0.00 %'
        },
        {
            estrategia: "CENTER_FIRST",
            jugadas: ecf || 0,
            perdidas: ecf - (ecfw || 0) || 0,
            ganadas: ecfw || 0,
            porcentaje: ecf ? ((ecfw || 0) / ecf * 100).toFixed(2) : '0.00 %'
        },
        {
            estrategia: "EDGE_FIRST",
            jugadas: eef || 0,
            perdidas: eef - (eefw || 0) || 0,
            ganadas: eefw || 0,
            porcentaje: eef ? ((eefw || 0) / eef * 100).toFixed(2) : '0.00 %'
        },
        {
            estrategia: "TOTALES",
            jugadas: er+ed+eo+ecf+eef || 0,
            perdidas: (er+ed+eo+ecf+eef) - (erw+edw+eow+ecfw+eefw || 0) || 0,
            ganadas: erw+edw+eow+ecfw+eefw || 0,
            porcentaje: (er+ed+eo+ecf+eef) ? (((erw+edw+eow+ecfw+eefw || 0)) / (er+ed+eo+ecf+eef) * 100).toFixed(2) : '0.00 %'
        }
        ];

        return stats;
    }

    /**
     * Función de calculo de estadisticas segun la dificultad
     */
    async function allstats(users, username) {
        // espera a encontrar el usuario en la base -> Jimena maneja la base
        const existingUser = await users.findOne({ "username": username });
        // si el usuario no existe
        if (!existingUser) {
            throw new UserError('Usuario incorrecto. Habla con Jimena', 404);
        }
        
        const difs = ["EASY", "MEDIUM", "HARD"];
        const stras = ["RANDOM", "OFFENSIVE"];

        const stats = [];

        for (const diff of difs) {
            for (const strat of stras) {

                const partidas = existingUser[`partida${diff}${strat}`] || 0;
                const wins = existingUser[`partida${diff}${strat}Wins`] || 0;

                stats.push({
                    dificultad: diff,
                    estrategia: strat,
                    jugadas: partidas,
                    perdidas: partidas - wins,
                    ganadas: wins,
                    porcentaje: partidas ? ((wins / partidas) * 100).toFixed(2) +' %' : '0.00 %'
                });
            }
        }

        return stats;
    }

module.exports = { loginuser, createuser, findUser, initmatch, endmatch, diffstats, stratstats, allstats };