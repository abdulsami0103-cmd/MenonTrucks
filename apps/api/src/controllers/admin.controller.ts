import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      totalMessages,
      totalFavorites,
      totalCategories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'REJECTED' } }),
      prisma.message.count(),
      prisma.favorite.count(),
      prisma.category.count(),
    ]);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const newListingsThisMonth = await prisma.listing.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        isSuspended: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Recent listings needing moderation
    const pendingModerationListings = await prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        seller: { select: { id: true, name: true, companyName: true } },
        category: { select: { name: true } },
        images: { take: 1, orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalListings,
        activeListings,
        pendingListings,
        rejectedListings,
        totalMessages,
        totalFavorites,
        totalCategories,
        newUsersThisMonth,
        newListingsThisMonth,
      },
      recentUsers,
      pendingModerationListings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const suspended = req.query.suspended as string;

    const where: any = {};
    if (role) where.role = role;
    if (suspended === 'true') where.isSuspended = true;
    if (suspended === 'false') where.isSuspended = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          companyName: true,
          avatar: true,
          isSuspended: true,
          isVerified: true,
          city: true,
          country: true,
          createdAt: true,
          _count: {
            select: { listings: true, sentMessages: true, receivedMessages: true, favorites: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        companyName: true,
        companyDesc: true,
        website: true,
        avatar: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        isSuspended: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { listings: true, sentMessages: true, receivedMessages: true, favorites: true },
        },
        listings: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            price: true,
            views: true,
            createdAt: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleUserSuspension = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'ADMIN') {
      res.status(400).json({ error: 'Cannot suspend admin users' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isSuspended: !user.isSuspended },
      select: { id: true, name: true, email: true, isSuspended: true },
    });

    res.json({ user: updated, message: updated.isSuspended ? 'User suspended' : 'User unsuspended' });
  } catch (error) {
    console.error('Toggle suspension error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['BUYER', 'SELLER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'ADMIN') {
      res.status(400).json({ error: 'Cannot delete admin users' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// LISTING MODERATION
// ==========================================

export const getListingsForModeration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { seller: { name: { contains: search, mode: 'insensitive' } } },
        { seller: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, companyName: true, email: true } },
          category: { select: { name: true } },
          images: { take: 1, orderBy: { order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get listings for moderation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const moderateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const newStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED';

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: newStatus },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    res.json({ listing: updated, message: `Listing ${action === 'approve' ? 'approved' : 'rejected'}` });
  } catch (error) {
    console.error('Moderate listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    await prisma.listing.delete({ where: { id } });
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// CATEGORY MANAGEMENT (Admin-specific views)
// ==========================================

export const getAdminCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { name: true } },
        _count: { select: { listings: true, children: true } },
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
