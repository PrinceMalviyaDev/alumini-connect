import { Router } from 'express';
import { submitFeedback, getAlumniFeedback, getStudentSuggestions } from '@/controllers/feedbackController';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.post('/:requestId', authenticate, submitFeedback);
router.get('/alumni/:alumniId', getAlumniFeedback);
router.get('/suggestions/mine', authenticate, getStudentSuggestions);

export default router;
