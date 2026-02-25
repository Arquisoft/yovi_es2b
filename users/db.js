const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;


let db;
let client;

/*
 * Conectarse a la base de datos
 */
async function connectDB() {
  console.log("intento conectar");
  if (!uri) {
    console.log("URI error");
    throw new Error("MONGO_URI mal definida -> Habla con Jimena");
  }

  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db("yovi_es2bJ");
    console.log("MongoDB conectado");
    global.__dbConnected = true;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

/*
 * Retorna la base de datos
 */
function getDB() {
  if (!db) throw new Error("Base de datos inexistente -> Habla con Jimena");

  return db;
}

module.exports = { connectDB, getDB };