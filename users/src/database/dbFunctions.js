/*
 * Función de registro de un usuario existente
 */
async function loginuser(users, username, password) {

    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string') {
        throw new Error('Ususario inválido');
    }
    if (!password || typeof password !== 'string') {
        throw new Error('Contraseña inválida');
    }

    // espera a encontrar el usuario en la base -> Jimena maneja la base
    const existingUser = await users.findOne({ "username": username });
    // si el usuario no existe
    if (!existingUser) {
        throw new Error('Usuario incorrecto. Prueba con otro o regístrate.');
    }
    // si la contraseña es incorrecta
    if(existingUser.password !== password) {
        throw new Error('Contraseña incorrecta. Inténtalo de nuevo.');
    }

    // todo bien
    return { message: 'Usuario encontrado exitosamente. Iniciando sesión...' };
}

/**
 * Función de creación de usuario
 */
async function createuser(users, username, password) {
    // que no sea usuario vacío 
    if (!username || typeof username !== 'string') { 
        throw new Error('Ususario inválido'); 
    } 
    // que no sea contraseña vacía
    if (!password || typeof password !== 'string') { 
        throw new Error('Contraseña inválida'); 
    }

    // busca si existe usuario con ese nombre
    const existingUser = await users.findOne({ "username": username });
    if (existingUser) {
        throw new Error('Ese usuario ya existe. Prueba con otro o inicie sesión.');
    }

    // comprueba una contraseña correcta
    checkPassword(password);

    // espera a crear el usuario en la base -> Jimena maneja la base
    await users.insertOne({ username, password, createdAt: new Date() });

    // todo bien
    return { message: 'Usuario creado exitosamente. Iniciando sesión...' };
}

/**
 * Comprueba que una contraseña sea correcta
 * en la creación del usuario
 */
function checkPassword(password) {
    // contraseña de más de 5 caracteres
    if(password.length < 5) {
        throw new Error('La contraseña debe tener 6 o más caracteres.');
    }

    // contraseña tiene una mayúscula
    if (!password.match(/[A-Z]/)) {
        throw new Error('La contraseña debe contener al menos una mayúscula');
    }

    // contraseña tiene una minúscula
    if (!password.match(/[a-z]/)) {
        throw new Error('La contraseña debe contener al menos una minúscula');
    }

    // contraseña tiene un número
    if (!password.match(/[0-9]/)) {
        throw new Error('La contraseña debe contener al menos un número');
    }
}


module.exports = { loginuser, createuser };