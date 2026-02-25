const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

let db;

/*
 * Conectarse a la base de datos
 */
async function connectDB() {
  if (!uri) throw new Error("MONGO_URI mal definida -> Habla con Jimena");

  try {
    await client.connect();
    db = client.db("yovi_es2bJ");
    console.log("MongoDB conectado");
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