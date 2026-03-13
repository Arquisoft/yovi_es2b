// para la creación de cliente mongo
// asi nos conectamos a la base de datos mediante un cliente para cada peticion de juego
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;


let db;
let client;

/*
 * Conectarse a la base de datos
 */
async function connectDB() {
  // error con la URI
  if (uri == null) {
    throw new Error("MONGO_URI mal definida -> Habla con Jimena");
  }

  // crea un cliente nuevo para cada conexión
  client = new MongoClient(uri);  

  try {

    // se conecta a la base
    // se usa await porque devuelve un Promise, básicamente espera a que se conecte
    await client.connect();
    db = client.db("yovi_es2bJ");

    // ya se conectó
    global.__bdConectada = true;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

/*
 * Retorna la base de datos
 */
function getDB() {
  if (!db) {
    throw new Error("Base de datos inexistente -> Habla con Jimena");
  }

  return db;
}

module.exports = { connectDB, getDB };