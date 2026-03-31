import { Request, Response } from 'express';
import { Feedback } from '@/models/Feedback';
import { MentorshipRequest } from '@/models/MentorshipRequest';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { createNotification } from '@/helpers/createNotification';
import { getIO } from '@/socket/instance';

export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { rating, comment } = req.body;
    const fromUserId = req.user!.userId;
    const fromRole = req.user!.role;

    const mentorshipRequest = await MentorshipRequest.findById(requestId);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Mentorship request not found' });
      return;
    }

    if (mentorshipRequest.status !== 'completed') {
      res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed sessions' });
      return;
    }

    if (fromRole === 'student') {
      // Student submitting feedback to alumni
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        return;
      }
      if (mentorshipRequest.studentId.toString() !== fromUserId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
      if (mentorshipRequest.studentFeedbackDone) {
        res.status(400).json({ success: false, message: 'You have already submitted feedback for this session' });
        return;
      }

      const toUserId = mentorshipRequest.alumniId.toString();

      const feedback = await Feedback.create({
        requestId,
        fromUserId,
        toUserId,
        rating,
        comment: comment || '',
        type: 'student-to-alumni',
      });

      // Update alumni rating
      const alumniProfile = await AlumniProfile.findOne({ userId: toUserId });
      if (alumniProfile) {
        const newReviewCount = alumniProfile.reviewCount + 1;
        const newAvgRating =
          (alumniProfile.averageRating * alumniProfile.reviewCount + rating) / newReviewCount;
        alumniProfile.reviewCount = newReviewCount;
        alumniProfile.averageRating = Math.round(newAvgRating * 100) / 100;
        await alumniProfile.save();
      }

      mentorshipRequest.studentFeedbackDone = true;
      await mentorshipRequest.save();

      const fromUser = await User.findById(fromUserId).select('name');
      const io = getIO();
      await createNotification(
        io,
        toUserId,
        'feedback_received',
        'New Feedback Received',
        `${fromUser?.name || 'Someone'} has left you feedback with a rating of ${rating}/5`,
        '/sessions'
      );

      res.status(201).json({ success: true, data: { feedback } });
    } else if (fromRole === 'alumni') {
      // Alumni submitting suggestion to student
      if (!comment || comment.trim().length < 10) {
        res.status(400).json({ success: false, message: 'Suggestion must be at least 10 characters' });
        return;
      }
      if (mentorshipRequest.alumniId.toString() !== fromUserId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
      if (mentorshipRequest.alumniFeedbackDone) {
        res.status(400).json({ success: false, message: 'You have already submitted a suggestion for this session' });
        return;
      }

      const toUserId = mentorshipRequest.studentId.toString();

      const feedback = await Feedback.create({
        requestId,
        fromUserId,
        toUserId,
        comment: comment.trim(),
        type: 'alumni-to-student',
      });

      mentorshipRequest.alumniFeedbackDone = true;
      await mentorshipRequest.save();

      const fromUser = await User.findById(fromUserId).select('name');
      const io = getIO();
      await createNotification(
        io,
        toUserId,
        'feedback_received',
        'New Suggestion from Mentor',
        `${fromUser?.name || 'Your mentor'} has shared a suggestion for you`,
        '/requests'
      );

      res.status(201).json({ success: true, data: { feedback } });
    } else {
      res.status(403).json({ success: false, message: 'Invalid role for feedback' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getAlumniFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { alumniId } = req.params;

    const feedback = await Feedback.find({ toUserId: alumniId, type: 'student-to-alumni' })
      .populate('fromUserId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { feedback } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getStudentSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const suggestions = await Feedback.find({ toUserId: userId, type: 'alumni-to-student' })
      .populate('fromUserId', 'name avatar')
      .populate('requestId', 'topic')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
