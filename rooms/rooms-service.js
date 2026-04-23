'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const roomManager = require('./room-manager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const GAMEY_URL = process.env.GAMEY_URL || 'http://localhost:4000';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

function difficultyToSize(difficulty) {
  const map = { EASY: 8, MEDIUM: 10, HARD: 12 };
  return map[difficulty] || 10;
}

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

async function relayMove(gameId, player, x, y, z) {
  const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player, x, y, z }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function relayUndo(gameId) {
  const res = await fetch(`${GAMEY_URL}/v1/games/${encodeURIComponent(gameId)}/undo`, {
    method: 'POST',
  });
  if (!res.ok) return null;
  return res.json();
}

io.on('connection', (socket) => {
  // Jugador 1 crea una sala
  socket.on('create-room', async ({ username, difficulty }) => {
    try {
      const boardSize = difficultyToSize(difficulty);
      const gameId = await createGameOnGameY(boardSize);
      const room = roomManager.createRoom(socket.id, username, difficulty);
      room.gameId = gameId;
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

    console.log('[make-move] gameId:', room.gameId, 'player:', player, 'x:', x, 'y:', y, 'z:', z);
    const data = await relayMove(room.gameId, player, x, y, z);
    console.log('[relayMove] response:', JSON.stringify(data));
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
server.listen(PORT, () => {
  console.log(`Rooms service listening on port ${PORT}`);
});
