import { Server } from 'socket.io';
import { Notification, NotificationType } from '@/models/Notification';
import { sendNotificationToUser } from '@/socket';

export async function createNotification(
  io: Server,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  const notification = await Notification.create({ userId, type, title, message, link });
  sendNotificationToUser(io, userId, notification);
  return notification;
}
