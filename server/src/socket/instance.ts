import { Server } from 'socket.io';

let _io: Server | null = null;

export function setIO(server: Server): void {
  _io = server;
}

export function getIO(): Server {
  if (!_io) {
    throw new Error('Socket.io not initialized. Call setIO first.');
  }
  return _io;
}
