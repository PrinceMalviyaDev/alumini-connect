import { Request, Response } from 'express';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Feedback } from '@/models/Feedback';

export async function upsertAlumniProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      company,
      jobTitle,
      industry,
      mentorshipAreas,
      availability,
      isAcceptingRequests,
      yearsOfExperience,
      location,
    } = req.body;

    const updates: Record<string, unknown> = {};
    if (company !== undefined) updates.company = company;
    if (jobTitle !== undefined) updates.jobTitle = jobTitle;
    if (industry !== undefined) updates.industry = industry;
    if (mentorshipAreas !== undefined) updates.mentorshipAreas = mentorshipAreas;
    if (availability !== undefined) updates.availability = availability;
    if (isAcceptingRequests !== undefined) updates.isAcceptingRequests = isAcceptingRequests;
    if (yearsOfExperience !== undefined) updates.yearsOfExperience = yearsOfExperience;
    if (location !== undefined) updates.location = location;

    const profile = await AlumniProfile.findOneAndUpdate(
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

export async function getAlumniDirectory(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      industries,
      mentorshipAreas,
      minRating,
      acceptingOnly,
      gradYearMin,
      gradYearMax,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build profile filter
    const profileFilter: Record<string, unknown> = {};
    if (industries) {
      const industriesArr = (industries as string).split(',').map((i) => i.trim()).filter(Boolean);
      if (industriesArr.length) profileFilter.industry = { $in: industriesArr };
    }
    if (mentorshipAreas) {
      const areasArr = (mentorshipAreas as string).split(',').map((a) => a.trim()).filter(Boolean);
      if (areasArr.length) profileFilter.mentorshipAreas = { $in: areasArr };
    }
    if (minRating) profileFilter.averageRating = { $gte: parseFloat(minRating as string) };
    if (acceptingOnly === 'true') profileFilter.isAcceptingRequests = true;

    // Build user filter
    const userFilter: Record<string, unknown> = { role: 'alumni', isActive: true };
    if (gradYearMin) userFilter.graduationYear = { $gte: parseInt(gradYearMin as string) };
    if (gradYearMax) {
      userFilter.graduationYear = { ...(userFilter.graduationYear as object || {}), $lte: parseInt(gradYearMax as string) };
    }

    // Restrict to active alumni users, optionally filtered by name
    if (search) {
      const regex = new RegExp(search as string, 'i');
      userFilter.name = regex;
    }
    const activeAlumni = await User.find(userFilter).select('_id').lean();
    profileFilter.userId = { $in: activeAlumni.map((u) => u._id) };

    const totalProfiles = await AlumniProfile.countDocuments(profileFilter);
    const profiles = await AlumniProfile.find(profileFilter).skip(skip).limit(limitNum).lean();

    const profileUserIds = profiles.map((p) => p.userId.toString());
    const usersForProfiles = await User.find({ _id: { $in: profileUserIds } })
      .select('-passwordHash')
      .lean();

    const userMap = new Map(usersForProfiles.map((u) => [u._id.toString(), u]));

    const result = profiles
      .map((profile) => ({
        user: userMap.get(profile.userId.toString()),
        profile,
      }))
      .filter((item) => item.user !== undefined);

    res.json({
      success: true,
      data: {
        alumni: result,
        pagination: {
          total: totalProfiles,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalProfiles / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getAlumniById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user || user.role !== 'alumni') {
      res.status(404).json({ success: false, message: 'Alumni not found' });
      return;
    }

    const profile = await AlumniProfile.findOne({ userId: id }).lean();
    const reviews = await Feedback.find({ toUserId: id, type: 'student-to-alumni' })
      .populate('fromUserId', 'name avatar')
      .lean();

    res.json({ success: true, data: { user, profile, reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const profile = await AlumniProfile.findOne({ userId: req.user!.userId }).lean();
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.json({ success: true, data: { profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function toggleAcceptingRequests(req: Request, res: Response): Promise<void> {
  try {
    const profile = await AlumniProfile.findOne({ userId: req.user!.userId });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Alumni profile not found' });
      return;
    }

    profile.isAcceptingRequests = !profile.isAcceptingRequests;
    await profile.save();

    res.json({ success: true, data: { isAcceptingRequests: profile.isAcceptingRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
