import { Router } from 'express';
import { submitFeedback, getAlumniFeedback } from '@/controllers/feedbackController';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.post('/:requestId', authenticate, submitFeedback);
router.get('/alumni/:alumniId', getAlumniFeedback);

export default router;
