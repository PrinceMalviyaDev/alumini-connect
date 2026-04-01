import { Request, Response } from 'express';
import { MentorshipRequest } from '@/models/MentorshipRequest';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { createNotification } from '@/helpers/createNotification';
import { getIO } from '@/socket/instance';

export async function createRequest(req: Request, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;
    const { alumniId, topic, message, proposedSlots } = req.body;

    if (!alumniId || !topic || !message) {
      res.status(400).json({ success: false, message: 'alumniId, topic, and message are required' });
      return;
    }

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      res.status(404).json({ success: false, message: 'Alumni not found' });
      return;
    }

    const alumniProfile = await AlumniProfile.findOne({ userId: alumniId });
    if (alumniProfile && !alumniProfile.isAcceptingRequests) {
      res.status(400).json({ success: false, message: 'This alumni is not accepting mentorship requests' });
      return;
    }

    const mentorshipRequest = await MentorshipRequest.create({
      studentId,
      alumniId,
      topic,
      message,
      proposedSlots: proposedSlots || [],
    });

    const student = await User.findById(studentId).select('name');
    const io = getIO();
    await createNotification(
      io,
      alumniId,
      'request_received',
      'New Mentorship Request',
      `${student?.name || 'A student'} has sent you a mentorship request on "${topic}"`,
      '/dashboard'
    );

    res.status(201).json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getStudentRequests(req: Request, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;

    const requests = await MentorshipRequest.find({ studentId })
      .populate('alumniId', '-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const alumniIds = requests.map((r) => {
      const id = r.alumniId as unknown as { _id: string };
      return id._id?.toString() || r.alumniId.toString();
    });

    const profiles = await AlumniProfile.find({ userId: { $in: alumniIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    // Fetch alumni suggestions for completed requests
    const completedIds = requests.filter((r) => r.status === 'completed').map((r) => r._id);
    const suggestions = completedIds.length > 0
      ? await (await import('@/models/Feedback')).Feedback.find({
          requestId: { $in: completedIds },
          type: 'alumni-to-student',
        }).lean()
      : [];
    const suggestionMap = new Map(suggestions.map((s) => [s.requestId.toString(), s]));

    const result = requests.map((request) => {
      const alumniUser = request.alumniId as unknown as Record<string, unknown>;
      const alumniIdStr = (alumniUser._id as string)?.toString() || request.alumniId.toString();
      return {
        ...request,
        alumniProfile: profileMap.get(alumniIdStr) || null,
        alumniFeedback: suggestionMap.get(request._id.toString()) || null,
      };
    });

    res.json({ success: true, data: { requests: result } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getAlumniRequests(req: Request, res: Response): Promise<void> {
  try {
    const alumniId = req.user!.userId;

    const requests = await MentorshipRequest.find({ alumniId })
      .populate('studentId', '-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = requests.map((r) => {
      const id = r.studentId as unknown as { _id: string };
      return id._id?.toString() || r.studentId.toString();
    });

    const profiles = await (await import('@/models/StudentProfile')).StudentProfile
      .find({ userId: { $in: studentIds } })
      .lean();
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    // Fetch feedback for completed requests
    const completedIds = requests.filter((r) => r.status === 'completed').map((r) => r._id);
    const feedbacks = completedIds.length > 0
      ? await (await import('@/models/Feedback')).Feedback.find({
          requestId: { $in: completedIds },
          type: 'student-to-alumni',
        }).lean()
      : [];
    const feedbackMap = new Map(feedbacks.map((f) => [f.requestId.toString(), f]));

    const result = requests.map((request) => {
      const studentUser = request.studentId as unknown as Record<string, unknown>;
      const studentIdStr = (studentUser._id as string)?.toString() || request.studentId.toString();
      return {
        ...request,
        studentProfile: profileMap.get(studentIdStr) || null,
        studentFeedback: feedbackMap.get(request._id.toString()) || null,
      };
    });

    res.json({ success: true, data: { requests: result } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { scheduledAt: scheduledAtStr, sessionLink: providedLink } = req.body;

    const mentorshipRequest = await MentorshipRequest.findById(id);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (mentorshipRequest.alumniId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (mentorshipRequest.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Request is not pending' });
      return;
    }

    const scheduledAt = scheduledAtStr
      ? new Date(scheduledAtStr)
      : mentorshipRequest.proposedSlots[0];

    if (!providedLink?.trim()) {
      res.status(400).json({ success: false, message: 'Meeting link is required (Google Meet, Zoom, etc.)' });
      return;
    }

    const sessionLink = providedLink.trim();

    mentorshipRequest.status = 'accepted';
    mentorshipRequest.scheduledAt = scheduledAt;
    mentorshipRequest.sessionLink = sessionLink;
    await mentorshipRequest.save();

    const alumni = await User.findById(req.user!.userId).select('name');
    const io = getIO();
    await createNotification(
      io,
      mentorshipRequest.studentId.toString(),
      'request_accepted',
      'Mentorship Request Accepted',
      `${alumni?.name || 'An alumni'} has accepted your mentorship request on "${mentorshipRequest.topic}"`,
      '/requests'
    );

    res.json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function declineRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { declineReason } = req.body;

    const mentorshipRequest = await MentorshipRequest.findById(id);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (mentorshipRequest.alumniId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (mentorshipRequest.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Request is not pending' });
      return;
    }

    mentorshipRequest.status = 'declined';
    if (declineReason) mentorshipRequest.sessionNotes = declineReason;
    await mentorshipRequest.save();

    const alumni = await User.findById(req.user!.userId).select('name');
    const io = getIO();
    await createNotification(
      io,
      mentorshipRequest.studentId.toString(),
      'request_declined',
      'Mentorship Request Declined',
      `${alumni?.name || 'An alumni'} has declined your mentorship request on "${mentorshipRequest.topic}"`,
      '/requests'
    );

    res.json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function completeRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const mentorshipRequest = await MentorshipRequest.findById(id);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (mentorshipRequest.alumniId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (mentorshipRequest.status !== 'accepted') {
      res.status(400).json({ success: false, message: 'Request must be accepted before completing' });
      return;
    }

    mentorshipRequest.status = 'completed';
    await mentorshipRequest.save();

    await AlumniProfile.findOneAndUpdate(
      { userId: req.user!.userId },
      { $inc: { totalSessions: 1 } }
    );

    const alumni = await User.findById(req.user!.userId).select('name');
    const io = getIO();
    await createNotification(
      io,
      mentorshipRequest.studentId.toString(),
      'session_completed',
      'Session Completed',
      `Your mentorship session with ${alumni?.name || 'the alumni'} on "${mentorshipRequest.topic}" has been marked as completed`,
      '/sessions'
    );

    res.json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function cancelRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const mentorshipRequest = await MentorshipRequest.findById(id);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (mentorshipRequest.studentId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (mentorshipRequest.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
      return;
    }

    mentorshipRequest.status = 'cancelled';
    await mentorshipRequest.save();

    res.json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function addSessionNotes(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { sessionNotes } = req.body;

    const mentorshipRequest = await MentorshipRequest.findById(id);
    if (!mentorshipRequest) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (mentorshipRequest.alumniId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    mentorshipRequest.sessionNotes = sessionNotes;
    await mentorshipRequest.save();

    res.json({ success: true, data: { request: mentorshipRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
