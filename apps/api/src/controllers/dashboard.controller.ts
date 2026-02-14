import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const [
      totalListings,
      activeListings,
      pendingListings,
      draftListings,
      totalViews,
      totalFavorites,
      totalMessages,
      unreadMessages,
    ] = await Promise.all([
      prisma.listing.count({ where: { sellerId: userId } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'ACTIVE' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'PENDING' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'DRAFT' } }),
      prisma.listing.aggregate({
        where: { sellerId: userId },
        _sum: { views: true },
      }),
      prisma.favorite.count({
        where: { listing: { sellerId: userId } },
      }),
      prisma.message.count({ where: { receiverId: userId } }),
      prisma.message.count({ where: { receiverId: userId, status: 'UNREAD' } }),
    ]);

    // Recent listings
    const recentListings = await prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recent messages
    const recentMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, name: true, companyName: true, avatar: true } },
        listing: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      stats: {
        totalListings,
        activeListings,
        pendingListings,
        draftListings,
        totalViews: totalViews._sum.views || 0,
        totalFavorites,
        totalMessages,
        unreadMessages,
      },
      recentListings,
      recentMessages,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
