import { Router } from 'express';
import { createRegret, getRegrets, likeRegret, dislikeRegret, deleteRegret } from '@/controllers/regretController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/', authenticate, getRegrets);
router.post('/', authenticate, requireRole('alumni'), createRegret);
router.post('/:id/like', authenticate, likeRegret);
router.post('/:id/dislike', authenticate, dislikeRegret);
router.delete('/:id', authenticate, deleteRegret);

export default router;
