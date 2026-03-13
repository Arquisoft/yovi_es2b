//Express implementa los metodos de HTTP (GET, POST, PUT, DELETE, etc.) y facilita la creación de servidores web en Node.js.
const express = require('express');
const swaggerUi = require('swagger-ui-express'); //Implementamos metodos de swagger, paquete que permite servir la documentación de la API generada por Swagger en una aplicación Express.
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');

// Importamos las funciones necesarias para interactuar con la base de datos y manejar la lógica de usuarios.
// necesidades para tener la base de datos
const { connectDB, getDB } = require('./database/db');
const User = require('./users'); // La clase con la lógica
const UserController = require('./user-controller');   // El controlador de rutas

const app = express(); //creamos instancia de express para el manejo de las peticiones
const port = 3000; //definimos el puerto en el que se ejecutará el servicio de usuarios (3000)

// Estas métricas son útiles para entender el rendimiento del servicio y detectar posibles problemas.
// El middleware de métricas se configura para incluir el método HTTP en las métricas recopiladas
// Esto que permite analizar el rendimiento de cada tipo de solicitud (GET, POST, etc.).
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

//
try {
  //Lee el archivo openapi.yaml, que contiene la definición de la API en formato OpenAPI, y lo carga en una variable llamada swaggerDocument.
  //YAML.load convierte ese texto (que está en formato YAML) en un objeto de JavaScript que el programa pueda entender
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  //Crea un endpoint (creando una pagina web), donde /api-docs define el URL, el serve levanta el servidor de documentación (archivos para la web), y setup configura ese servidor (genera la lista de endpoints).
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log(e);
}

//Se configura el middleware para manejar CORS (Cross-Origin Resource Sharing)
// Permite que el servicio de usuarios pueda ser accedido desde diferentes dominios.
app.use((req, res, next) => 
{
  // Configura los encabezados de CORS para permitir solicitudes desde cualquier origen, con métodos GET, POST y OPTIONS, y con el encabezado Content-Type.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  //Si la web intenta hacer un POST o GET a JSON a otro servidor, se envía un mensaje de "preflight" (OPTIONS) para verificar si el servidor permite esa solicitud.
  // Si es así, se responde con un estado 204 (No Content) para indicar que la solicitud es válida y se puede proceder con el POST o GET real.
  if (req.method === 'OPTIONS') return res.sendStatus(204); 
  next();
});

app.use(express.json());

app.post('/loginuser', async (req, res) => {

  // si no se ha conectado la bd, lo hace
  if(!global.__dbConnected) {
    await connectDB();
    global.__bdConectada = true;
  }

  const username = req.body && req.body.username;
  const password = req.body && req.body.password;
  try {
    // primero, traemos la base de datos
    const db = getDB();
    const users = db.collection("users");

    // creamos y añadimo el usuario a la base de datos
    // mirar /users/db.js
    await loginuser(users, username, password);
    
    // Simulate a 1 second delay to mimic processing/network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = `Hello ${username}! welcome to the course!`;
    res.json({ message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/createuser', async (req, res) => {

  // si no se ha conectado la bd, lo hace
  if(!global.__bdConectada) {
    await connectDB();
    global.__bdConectada = true;
  }

  const username = req.body && req.body.username;
  const password = req.body && req.body.password;
  try {
    // primero, traemos la base de datos
    const db = getDB();
    const users = db.collection("users");

    // creamos y añadimo el usuario a la base de datos
    // mirar /users/db.js
    await createuser(users, username, password);
    
    // Simulate a 1 second delay to mimic processing/network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = `Hello ${username}! welcome to the course!`;
    res.json({ message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


if (require.main === module) {
  connectDB().then(() => {
      app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
    })
  });
}

module.exports = app
