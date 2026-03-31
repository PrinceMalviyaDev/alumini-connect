import { Router } from 'express';
import {
  getNotifications,
  markAllRead,
  markOneRead,
  getUnreadCount,
} from '@/controllers/notificationController';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markOneRead);

export default router;
