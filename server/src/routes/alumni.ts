import { Router } from 'express';
import {
  getAlumniDirectory,
  getAlumniById,
  getMyProfile,
  upsertAlumniProfile,
  toggleAcceptingRequests,
} from '@/controllers/alumniController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.get('/', getAlumniDirectory);
router.get('/my-profile', authenticate, requireRole('alumni'), getMyProfile);
router.get('/:id', getAlumniById);
router.post('/profile', authenticate, requireRole('alumni'), upsertAlumniProfile);
router.put('/profile', authenticate, requireRole('alumni'), upsertAlumniProfile);
router.put('/toggle-accepting', authenticate, requireRole('alumni'), toggleAcceptingRequests);

export default router;
