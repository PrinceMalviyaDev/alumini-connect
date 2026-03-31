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

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const mentorshipRequest = await MentorshipRequest.findById(requestId);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Mentorship request not found' });
      return;
    }

    if (mentorshipRequest.status !== 'completed') {
      res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed sessions' });
      return;
    }

    // Only students can leave feedback with ratings
    if (fromRole !== 'student') {
      res.status(403).json({ success: false, message: 'Only students can submit feedback' });
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
    const type: 'student-to-alumni' = 'student-to-alumni';

    const feedback = await Feedback.create({
      requestId,
      fromUserId,
      toUserId,
      rating,
      comment: comment || '',
      type,
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
