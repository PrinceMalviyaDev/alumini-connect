import { Request, Response } from 'express';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { StudentProfile } from '@/models/StudentProfile';
import { MentorshipRequest } from '@/models/MentorshipRequest';

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalAlumni,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
      sessionsThisWeek,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      MentorshipRequest.countDocuments(),
      MentorshipRequest.countDocuments({ status: 'pending' }),
      MentorshipRequest.countDocuments({ status: 'accepted' }),
      MentorshipRequest.countDocuments({ status: 'completed' }),
      MentorshipRequest.countDocuments({ status: 'completed', updatedAt: { $gte: weekAgo } }),
    ]);

    const ratingAgg = await AlumniProfile.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
    ]);
    const averageRating =
      ratingAgg.length > 0 ? Math.round((ratingAgg[0].avgRating as number) * 100) / 100 : 0;

    const topMentorsProfiles = await AlumniProfile.find()
      .sort({ totalSessions: -1, averageRating: -1 })
      .limit(5)
      .lean();

    const topMentorUserIds = topMentorsProfiles.map((p) => p.userId.toString());
    const topMentorUsers = await User.find({ _id: { $in: topMentorUserIds } })
      .select('name avatar email')
      .lean();
    const userMap = new Map(topMentorUsers.map((u) => [u._id.toString(), u]));

    const topMentors = topMentorsProfiles.map((profile) => ({
      user: userMap.get(profile.userId.toString()),
      profile: {
        company: profile.company,
        jobTitle: profile.jobTitle,
        industry: profile.industry,
        totalSessions: profile.totalSessions,
        averageRating: profile.averageRating,
      },
    }));

    const declinedRequests = await MentorshipRequest.countDocuments({ status: 'declined' });
    const cancelledRequests = await MentorshipRequest.countDocuments({ status: 'cancelled' });

    const requestsByStatus = [
      { status: 'pending', count: pendingRequests },
      { status: 'accepted', count: acceptedRequests },
      { status: 'completed', count: completedRequests },
      { status: 'declined', count: declinedRequests },
      { status: 'cancelled', count: cancelledRequests },
    ].filter((r) => r.count > 0);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalAlumni,
        totalRequests,
        completedSessions: completedRequests,
        sessionsThisWeek,
        averageRating,
        requestsByStatus,
        topMentors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', role } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((u) => u._id.toString());

    const [alumniProfiles, studentProfiles] = await Promise.all([
      AlumniProfile.find({ userId: { $in: userIds } }).lean(),
      StudentProfile.find({ userId: { $in: userIds } }).lean(),
    ]);

    const alumniMap = new Map(alumniProfiles.map((p) => [p.userId.toString(), p]));
    const studentMap = new Map(studentProfiles.map((p) => [p.userId.toString(), p]));

    const result = users.map((user) => ({
      ...user,
      alumniProfile: alumniMap.get(user._id.toString()) || null,
      studentProfile: studentMap.get(user._id.toString()) || null,
    }));

    res.json({
      success: true,
      data: {
        users: result,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function toggleUserActive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
