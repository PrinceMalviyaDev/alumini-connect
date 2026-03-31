import { Request, Response } from 'express';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const { industry, limit = '10' } = req.query;

    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));

    const profileFilter: Record<string, unknown> = {};
    if (industry) profileFilter.industry = industry;

    const profiles = await AlumniProfile.find(profileFilter)
      .sort({ totalSessions: -1, averageRating: -1 })
      .limit(limitNum)
      .lean();

    const userIds = profiles.map((p) => p.userId.toString());
    const users = await User.find({ _id: { $in: userIds }, isActive: true })
      .select('name avatar college graduationYear')
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const result = profiles
      .map((profile) => {
        const user = userMap.get(profile.userId.toString());
        if (!user) return null;
        return {
          user: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            college: user.college,
            graduationYear: user.graduationYear,
          },
          profile: {
            _id: profile._id,
            company: profile.company,
            jobTitle: profile.jobTitle,
            industry: profile.industry,
            totalSessions: profile.totalSessions,
            averageRating: profile.averageRating,
            reviewCount: profile.reviewCount,
          },
        };
      })
      .filter(Boolean);

    res.json({ success: true, data: { leaderboard: result } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
