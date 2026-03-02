/*
 * Función de creación de un usuario
 */
async function createUser(users, username) {
    // que no sea vacío o ERROR -> modificar para no repetir (?)
    if (!username || typeof username !== 'string') {
        throw new Error('Username inválido');
    }

    // espera a insertar el usuario en la base -> Jimena maneja la base
    await users.insertOne({ username, createdAt: new Date() });
}

module.exports = { createUser };