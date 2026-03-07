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

    // espera a insertar el usuario en la base -> Jimena maneja la base
    const existingUser = await users.findOne({ "username": username });
    if (!existingUser) {
        throw new Error('Usuario incorrecto. Prueba con otro o regístrate.');
    }
    if(existingUser.password !== password) {
        throw new Error('Contraseña incorrecta. Inténtalo de nuevo.');
    }

    return { message: 'Usuario encontrado exitosamente. Iniciando sesión...' };
}

/**
 * Función de creación de usuario
 */
async function createuser(users, username, password) {
    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string') { 
        throw new Error('Ususario inválido'); 
    } 
    if (!password || typeof password !== 'string') { 
        throw new Error('Contraseña inválida'); 
    }

    await users.insertOne({ username, password, createdAt: new Date() });
}


module.exports = { loginuser, createuser };