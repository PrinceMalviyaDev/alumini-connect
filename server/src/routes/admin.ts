import { Router } from 'express';
import { getStats, getUsers, toggleUserActive } from '@/controllers/adminController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireRole('admin'), getStats);
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.put('/users/:id/toggle-active', authenticate, requireRole('admin'), toggleUserActive);

export default router;
