import { Request, Response } from 'express';
import { StudentProfile } from '@/models/StudentProfile';
import { User } from '@/models/User';

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user!.userId }).lean();
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.json({ success: true, data: { profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function upsertStudentProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { major, currentYear, interests, careerGoals, resumeUrl } = req.body;

    const updates: Record<string, unknown> = {};
    if (major !== undefined) updates.major = major;
    if (currentYear !== undefined) updates.currentYear = currentYear;
    if (interests !== undefined) updates.interests = interests;
    if (careerGoals !== undefined) updates.careerGoals = careerGoals;
    if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    await User.findByIdAndUpdate(userId, { $set: { isOnboarded: true } });

    res.json({ success: true, data: { profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
