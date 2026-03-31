import { Router } from 'express';
import { getStats, getUsers, deactivateUser } from '@/controllers/adminController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireRole('admin'), getStats);
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.put('/users/:id/deactivate', authenticate, requireRole('admin'), deactivateUser);

export default router;
