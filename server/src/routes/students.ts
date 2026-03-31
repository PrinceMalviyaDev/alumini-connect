import { Router } from 'express';
import { getMyProfile, upsertStudentProfile } from '@/controllers/studentController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/my-profile', authenticate, requireRole('student'), getMyProfile);
router.post('/profile', authenticate, requireRole('student'), upsertStudentProfile);
router.put('/profile', authenticate, requireRole('student'), upsertStudentProfile);

export default router;
