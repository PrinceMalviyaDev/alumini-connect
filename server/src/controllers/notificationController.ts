import { Request, Response } from 'express';
import { Notification } from '@/models/Notification';

export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: { notifications } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function markOneRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, data: { notification } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
