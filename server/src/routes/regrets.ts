import { Router } from 'express';
import { createRegret, getRegrets, likeRegret, dislikeRegret, deleteRegret, addComment } from '@/controllers/regretController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/', authenticate, getRegrets);
router.post('/', authenticate, requireRole('alumni'), createRegret);
router.post('/:id/like', authenticate, requireRole('alumni'), likeRegret);
router.post('/:id/dislike', authenticate, requireRole('alumni'), dislikeRegret);
router.post('/:id/comment', authenticate, requireRole('alumni'), addComment);
router.delete('/:id', authenticate, deleteRegret);

export default router;
