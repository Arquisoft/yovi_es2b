'use strict';

// Este módulo se encarga de gestionar las salas de juego, incluyendo la creación de salas, unirse a ellas, obtener información y eliminar jugadores o salas completas.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const client = require('prom-client');
const roomManager = require('./room-manager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// URL de GameY, configurable mediante la variable de entorno GAMEY_URL. Por defecto, apunta a localhost:4000 para desarrollo local.
const GAMEY_URL = process.env.GAMEY_URL || 'http://localhost:4000';

// Registro de métricas para Prometheus
const register = new client.Registry();

/**
 * Métricas:
 * - rooms_created_total: contador del total de salas creadas desde el inicio del servicio. 
 * - rooms_active_total: gauge del número de salas activas en este momento (se actualiza cada vez que se consulta esta métrica). 
 * Gauge se utiliza en lugar de Counter porque el número de salas activas puede subir y bajar, mientras que el total de salas creadas solo puede aumentar.
 */
const roomsCreatedTotal = new client.Counter({
  name: 'rooms_created_total',
  help: 'Total number of rooms created since startup',
  registers: [register],
});

const roomsActiveTotal = new client.Gauge({
  name: 'rooms_active_total',
  help: 'Number of active rooms at this moment',
  registers: [register],
  collect() { this.set(roomManager.rooms.size); },
});

// Endpoint para verificar que el servicio está funcionando correctamente. Devuelve un JSON con el estado "ok".
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Endpoint para obtener las metricas.
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/**
 * Convierte un nivel de dificultad a un tamaño de tablero.
 * @param {*} difficulty 
 * @returns 
 */
function difficultyToSize(difficulty) {
  const map = { EASY: 8, MEDIUM: 10, HARD: 12 };
  return map[difficulty] || 10;
}

/**
 * Crea una partida en GameY.
 * @param {*} boardSize, el tamaño del tablero, que se determina a partir de la dificultad seleccionada por el jugador.
 * @returns el ID de la partida creada en GameY.
 * @throws un error si no se pudo crear la partida en GameY.
 */
async function createGameOnGameY(boardSize) {
  const res = await fetch(`${GAMEY_URL}/v1/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board_size: boardSize }),
  });
  if (!res.ok) throw new Error('Error al crear partida en GameY');
  const data = await res.json();
  return data.game_id;
}

/**
 * Función para el relegar un movimiento a GameY. 
 * Se llama cuando un jugador hace un movimiento en el cliente, y se encarga de enviar ese movimiento a GameY para que lo procese y actualice el estado de la partida.
 * @returns 
 */
async function relayMove(gameId, player, x, y, z) {
  const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player, x, y, z }),
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Función para relegar una solicitud de deshacer movimiento a GameY.
 * Se llama cuando un jugador solicita deshacer su último movimiento, y se encarga de enviar esa solicitud a GameY para que procese el deshacer y actualice el estado de la partida.
 * @returns 
 */
async function relayUndo(gameId) {
  const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/undo`, {
    method: 'POST',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Manejador de conexiones Socket.IO. 
 */
io.on('connection', (socket) => {
  // Jugador 1 crea una sala
  socket.on('create-room', async ({ username, difficulty, timerEnabled = false }) => {
    try {
      const boardSize = difficultyToSize(difficulty);
      const gameId = await createGameOnGameY(boardSize);
      const room = roomManager.createRoom(socket.id, username, difficulty, timerEnabled);
      room.gameId = gameId;
      roomsCreatedTotal.inc();
      socket.join(room.code);
      socket.emit('room-created', {
        code: room.code,
        gameId,
        playerIndex: 0,
      });
    } catch (err) {
      socket.emit('room-error', { message: 'Error al crear la sala' });
    }
  });

  // Jugador 2 se une con el código
  socket.on('join-room', ({ code, username }) => {
    const result = roomManager.joinRoom(code, socket.id, username);
    if (result.error) {
      socket.emit('room-error', { message: result.error });
      return;
    }
    const { room } = result;
    socket.join(room.code);

    socket.emit('room-joined', {
      code: room.code,
      gameId: room.gameId,
      playerIndex: 1,
      difficulty: room.difficulty,
      opponentUsername: room.players[0].username,
    });

    // Notifica a ambos que la partida empieza
    io.to(room.code).emit('game-start', {
      gameId: room.gameId,
      difficulty: room.difficulty,
      timerEnabled: room.timerEnabled,
      players: room.players.map(p => ({ username: p.username, playerIndex: p.playerIndex })),
    });
  });

  // Un jugador hace un movimiento
  socket.on('make-move', async ({ code, x, y, z, player }) => {
    const room = roomManager.getRoom(code);
    if (!room || !room.gameId) return;

    const playerObj = room.players.find(p => p.socketId === socket.id);
    if (!playerObj || playerObj.playerIndex !== player) {
      socket.emit('move-error', { message: 'No es tu turno' });
      return;
    }

    const data = await relayMove(room.gameId, player, x, y, z);
    if (!data) {
      socket.emit('move-error', { message: 'Movimiento inválido' });
      return;
    }

    io.to(room.code).emit('move-made', {
      state: data.state,
      status: data.status,
    });
  });

  // Un jugador solicita deshacer
  socket.on('undo-move', async ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room || !room.gameId) return;
    // Deshacer dos movimientos para que ambos jugadores vuelvan a su turno anterior
    await relayUndo(room.gameId);
    const data = await relayUndo(room.gameId);
    if (data) {
      io.to(room.code).emit('move-made', { state: data.state, status: data.status });
    }
  });

  // El timer del jugador activo expiró: pasa el turno al otro
  socket.on('timer-expired', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    const playerObj = room.players.find(p => p.socketId === socket.id);
    if (!playerObj) return;
    const nextPlayer = 1 - playerObj.playerIndex;
    io.to(room.code).emit('turn-skipped', { next_player: nextPlayer });
  });

  // Un jugador abandona
  socket.on('abandon-game', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socket.id);
    io.to(room.code).emit('player-disconnected', { username: player?.username });
    roomManager.deleteRoom(code);
  });

  // Desconexión inesperada
  socket.on('disconnect', () => {
    const result = roomManager.removePlayer(socket.id);
    if (result) {
      const { room, player } = result;
      if (room.players.length > 0) {
        io.to(room.code).emit('player-disconnected', { username: player.username });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT);
