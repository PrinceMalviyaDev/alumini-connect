import { Request, Response } from 'express';
import { User } from '@/models/User';

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const { name, bio, college, linkedIn, github, portfolio, avatar, graduationYear, isOnboarded } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (college !== undefined) updates.college = college;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (github !== undefined) updates.github = github;
    if (portfolio !== undefined) updates.portfolio = portfolio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (graduationYear !== undefined) updates.graduationYear = graduationYear;
    if (isOnboarded !== undefined) updates.isOnboarded = isOnboarded;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
