import { Request, Response } from 'express';
import { prisma } from '@menon/db';

export const getSellerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const seller = await prisma.user.findUnique({
      where: { id, role: 'SELLER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatar: true,
        companyName: true,
        companyLogo: true,
        companyDesc: true,
        website: true,
        city: true,
        country: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller not found' });
      return;
    }

    res.json({ seller });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', country } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = { role: 'SELLER' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          companyName: true,
          companyLogo: true,
          city: true,
          country: true,
          isVerified: true,
          _count: {
            select: { listings: { where: { status: 'ACTIVE' } } },
          },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      sellers,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
