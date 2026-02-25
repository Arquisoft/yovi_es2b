/*
 * Función de creación de un usuario
 */
async function createUser(users, username) {
    // que no sea vacío o ERROR
    if (!username || typeof username !== 'string') {
        throw new Error('Username inválido');
    }

    await users.insertOne({ username, createdAt: new Date() });
    console.log('Usuario creado');

}

module.exports = { createUser };