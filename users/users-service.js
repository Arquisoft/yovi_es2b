const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');

const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// necesidades para tener la base de datos
const { connectDB, getDB } = require('./db');
const { createUser } = require('./dbFunctions');

try {
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log(e);
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.post('/createuser', async (req, res) => {

  // si no se ha conectado la bd, lo hace
  if(!global.__bdConectada) {
    await connectDB();
    console.log('DB conectada');
  }

  const username = req.body && req.body.username;
  console.log('Recibido username:', username); // log de debug
  try {
    // primero, traemos la base de datos
    const db = getDB();
    console.log('DB obtenida');
    const users = db.collection("users");
    console.log('Colección users obtenida');

    // creamos y añadimo el usuario a la base de datos
    // mirar /users/db.js
    await createUser(users, username);
    
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
