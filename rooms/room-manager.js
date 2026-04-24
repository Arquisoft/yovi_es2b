'use strict';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(socketId, username, difficulty, timerEnabled = false) {
    const code = generateCode();
    const room = {
      code,
      players: [{ socketId, username, playerIndex: 0 }],
      gameId: null,
      difficulty,
      timerEnabled,
    };
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code, socketId, username) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'Sala no encontrada' };
    if (room.players.length >= 2) return { error: 'La sala está llena' };
    if (room.players[0].username === username) return { error: 'No puedes unirte con el mismo nombre que el creador de la sala' };
    room.players.push({ socketId, username, playerIndex: 1 });
    return { room };
  }

  getRoom(code) {
    return this.rooms.get(code.toUpperCase()) || null;
  }

  getRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) return room;
    }
    return null;
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.players.findIndex(p => p.socketId === socketId);
      if (idx !== -1) {
        const player = room.players[idx];
        room.players.splice(idx, 1);
        if (room.players.length === 0) this.rooms.delete(code);
        return { room, player };
      }
    }
    return null;
  }

  deleteRoom(code) {
    this.rooms.delete(code.toUpperCase());
  }
}

module.exports = new RoomManager();
