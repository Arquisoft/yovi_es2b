/// Interfaz que define la información de un juego en línea, 
export interface OnlineGameInfo {
  gameId: string;
  code: string;
  playerIndex: number;
  opponentUsername: string;
  difficulty: string;
  timerEnabled: boolean;
}
