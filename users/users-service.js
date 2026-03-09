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
const { loginuser, createuser } = require('./dbFunctions');

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

app.post('/loginuser', async (req, res) => {

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
