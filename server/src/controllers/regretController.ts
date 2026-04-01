import { Request, Response } from 'express';
import { Regret } from '@/models/Regret';

export async function createRegret(req: Request, res: Response): Promise<void> {
  try {
    const authorId = req.user!.userId;
    const { title, description } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required' });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ success: false, message: 'Title must be 200 characters or less' });
      return;
    }

    const regret = await Regret.create({ authorId, title, description });
    const populated = await regret.populate('authorId', 'name avatar');

    res.status(201).json({ success: true, data: { regret: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getRegrets(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', sort = 'latest' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOption: Record<string, 1 | -1> = sort === 'popular' ? { likes: -1 } : { createdAt: -1 };

    const total = await Regret.countDocuments();
    const regrets = await Regret.find()
      .populate('authorId', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        regrets,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function likeRegret(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const regret = await Regret.findById(id);
    if (!regret) {
      res.status(404).json({ success: false, message: 'Regret not found' });
      return;
    }

    const alreadyLiked = regret.likedBy.some((uid) => uid.toString() === userId);
    const alreadyDisliked = regret.dislikedBy.some((uid) => uid.toString() === userId);

    if (alreadyLiked) {
      // Undo like
      regret.likedBy = regret.likedBy.filter((uid) => uid.toString() !== userId);
      regret.likes = Math.max(0, regret.likes - 1);
    } else {
      // Add like, remove dislike if exists
      regret.likedBy.push(new (await import('mongoose')).Types.ObjectId(userId));
      regret.likes += 1;
      if (alreadyDisliked) {
        regret.dislikedBy = regret.dislikedBy.filter((uid) => uid.toString() !== userId);
        regret.dislikes = Math.max(0, regret.dislikes - 1);
      }
    }

    await regret.save();
    res.json({ success: true, data: { likes: regret.likes, dislikes: regret.dislikes, likedBy: regret.likedBy, dislikedBy: regret.dislikedBy } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function dislikeRegret(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const regret = await Regret.findById(id);
    if (!regret) {
      res.status(404).json({ success: false, message: 'Regret not found' });
      return;
    }

    const alreadyDisliked = regret.dislikedBy.some((uid) => uid.toString() === userId);
    const alreadyLiked = regret.likedBy.some((uid) => uid.toString() === userId);

    if (alreadyDisliked) {
      // Undo dislike
      regret.dislikedBy = regret.dislikedBy.filter((uid) => uid.toString() !== userId);
      regret.dislikes = Math.max(0, regret.dislikes - 1);
    } else {
      // Add dislike, remove like if exists
      regret.dislikedBy.push(new (await import('mongoose')).Types.ObjectId(userId));
      regret.dislikes += 1;
      if (alreadyLiked) {
        regret.likedBy = regret.likedBy.filter((uid) => uid.toString() !== userId);
        regret.likes = Math.max(0, regret.likes - 1);
      }
    }

    await regret.save();
    res.json({ success: true, data: { likes: regret.likes, dislikes: regret.dislikes, likedBy: regret.likedBy, dislikedBy: regret.dislikedBy } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function deleteRegret(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const regret = await Regret.findById(id);
    if (!regret) {
      res.status(404).json({ success: false, message: 'Regret not found' });
      return;
    }

    if (regret.authorId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await regret.deleteOne();
    res.json({ success: true, data: { message: 'Regret deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
