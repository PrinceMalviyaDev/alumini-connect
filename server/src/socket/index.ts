import { Server } from 'socket.io';

const userSocketMap = new Map<string, string>(); // userId -> socketId

export function initSocket(io: Server): void {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:room', (userId: string) => {
      userSocketMap.set(userId, socket.id);
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    });

    socket.on('disconnect', () => {
      for (const [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          userSocketMap.delete(uid);
          console.log(`User ${uid} disconnected`);
          break;
        }
      }
    });
  });
}

export function sendNotificationToUser(io: Server, userId: string, notification: object): void {
  io.to(`user:${userId}`).emit('notification:new', notification);
}
