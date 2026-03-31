import { Router } from 'express';
import {
  createRequest,
  getStudentRequests,
  getAlumniRequests,
  acceptRequest,
  declineRequest,
  completeRequest,
  cancelRequest,
  addSessionNotes,
} from '@/controllers/requestController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole('student'), createRequest);
router.get('/sent', authenticate, requireRole('student'), getStudentRequests);
router.get('/received', authenticate, requireRole('alumni'), getAlumniRequests);
router.put('/:id/accept', authenticate, requireRole('alumni'), acceptRequest);
router.put('/:id/decline', authenticate, requireRole('alumni'), declineRequest);
router.put('/:id/complete', authenticate, requireRole('alumni'), completeRequest);
router.put('/:id/notes', authenticate, requireRole('alumni'), addSessionNotes);
router.delete('/:id', authenticate, requireRole('student'), cancelRequest);

export default router;
