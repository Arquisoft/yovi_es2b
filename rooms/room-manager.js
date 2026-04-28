'use strict';

/**
 * Función para generar un código de sala único de 6 caracteres alfanuméricos de forma aleatoria.
 * @returns {string} El código de sala generado.
 */
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Clase para gestionar las salas de juego. 
 * Permite crear salas, unirse a ellas, obtener información y eliminar jugadores o salas completas.
 * Cada sala tiene un código único, una lista de jugadores, un ID de juego asociado (cuando se inicia la partida),
 */
class RoomManager {
  constructor() {
    this.rooms = new Map(); // Map de código de sala a objeto de sala. 
  }

  /**
   * Funcion para crear una sala de juego
   * Se obtiene un código único, se crea un objeto de sala con el jugador que la creó y se almacena en el Map de salas.
   * @param {*} socketId 
   * @param {*} username 
   * @param {*} difficulty 
   * @param {*} timerEnabled 
   * @returns 
   */
  createRoom(socketId, username, difficulty, timerEnabled = false) {
    const code = generateCode(); // Genera un código de sala único
    // Objeto de sala con el código, el jugador que la creó, el ID de juego (inicialmente null), la dificultad y si el temporizador está habilitado
    const room = {
      code,
      players: [{ socketId, username, playerIndex: 0 }],
      gameId: null,
      difficulty,
      timerEnabled,
    };
    // Almacena la sala en el Map de salas usando el código como clave
    this.rooms.set(code, room);
    return room;
  }

  /**
   * Función para unirse a una sala existente.
   * Busca la sala por su código, verifica que no esté llena y que el nombre del jugador no sea el mismo que el del creador de la sala, y luego agrega al jugador a la sala.
   * @param {*} code 
   * @param {*} socketId 
   * @param {*} username 
   * @returns 
   */
  joinRoom(code, socketId, username) {
    // Busca la sala por su código (en mayúsculas para evitar problemas de mayúsculas/minúsculas)
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'Sala no encontrada' };
    // Verifica que la sala no esté llena (máximo 2 jugadores)
    if (room.players.length >= 2) return { error: 'La sala está llena' };
    // Verifica que el nombre del jugador no sea el mismo que el del creador de la sala
    if (room.players[0].username === username) return { error: 'No puedes unirte con el mismo nombre que el creador de la sala' };
    // Agrega al jugador a la sala con el índice de jugador 1, ya que el creador de la sala tiene el índice 0
    room.players.push({ socketId, username, playerIndex: 1 });
    return { room };
  }

  /**
   * Función para obtener la información de una sala por su código. Devuelve null si no se encuentra la sala. 
   * @param {*} code 
   * @returns 
   */
  getRoom(code) {
    return this.rooms.get(code.toUpperCase()) || null;
  }

  /**
   * Función para obtener la sala a la que pertenece un jugador por su socketId. Devuelve null si no se encuentra ninguna sala con ese socketId.
   * @param {*} socketId 
   * @returns 
   */
  getRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) return room;
    }
    return null;
  }

  /**
   * Función para eliminar a un jugador de la sala a la que pertenece por su socketId. 
   * Si el jugador es el último en la sala, se elimina la sala completa. Devuelve el objeto de la sala y el jugador eliminado, o null si no se encuentra ningún jugador con ese socketId.
   * @param {*} socketId 
   * @returns 
   */
  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.players.findIndex(p => p.socketId === socketId);
      // Si se encuentra el jugador en la sala, se elimina de la lista de jugadores.
      // Si la sala queda vacía, se elimina la sala completa del Map.
      if (idx !== -1) {
        const player = room.players[idx];
        room.players.splice(idx, 1);
        if (room.players.length === 0) this.rooms.delete(code);
        return { room, player };
      }
    }
    return null;
  }

  /**
   * Función para eliminar una sala completa por su código. 
   * Se utiliza principalmente cuando un jugador abandona la sala y es el último en ella, o cuando se desea eliminar la sala por cualquier motivo.
   * @param {*} code 
   */
  deleteRoom(code) {
    this.rooms.delete(code.toUpperCase());
  }
}

module.exports = new RoomManager();
