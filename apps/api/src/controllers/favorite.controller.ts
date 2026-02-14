import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const userId = req.userId!;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({ data: { userId, listingId } });
      res.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              images: { take: 1, orderBy: { order: 'asc' } },
              category: { select: { id: true, name: true, slug: true } },
              seller: { select: { id: true, name: true, companyName: true, city: true, country: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    res.json({
      favorites: favorites.map((f) => ({ ...f.listing, favoritedAt: f.createdAt })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const userId = req.userId!;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    res.json({ favorited: !!existing });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
