import { Request, Response } from 'express';
import { prisma } from '@menon/db';
import slugify from 'slugify';
import { AuthRequest } from '../middleware/auth';

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specifications, ...data } = req.body;
    const sellerId = req.userId!;

    const slug = slugify(`${data.title}-${Date.now()}`, { lower: true, strict: true });

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        sellerId,
        status: 'PENDING',
        specifications: specifications
          ? { create: specifications }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        specifications: true,
        seller: {
          select: { id: true, name: true, companyName: true, city: true, country: true },
        },
      },
    });

    res.status(201).json({ listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      brand,
      model,
      condition,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      country,
      sortBy = 'newest',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status: 'ACTIVE' };

    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = { contains: brand as string, mode: 'insensitive' };
    if (model) where.model = { contains: model as string, mode: 'insensitive' };
    if (condition) where.condition = condition;
    if (country) where.country = { contains: country as string, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear as string, 10);
      if (maxYear) where.year.lte = parseInt(maxYear as string, 10);
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'year_asc': orderBy.year = 'asc'; break;
      case 'year_desc': orderBy.year = 'desc'; break;
      case 'oldest': orderBy.createdAt = 'asc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          seller: {
            select: { id: true, name: true, companyName: true, city: true, country: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, orderBy],
        skip,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getListingBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        specifications: true,
        seller: {
          select: {
            id: true, name: true, email: true, phone: true, whatsapp: true,
            companyName: true, companyLogo: true, city: true, country: true,
            avatar: true,
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Increment views
    await prisma.listing.update({
      where: { id: listing.id },
      data: { views: { increment: 1 } },
    });

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { specifications, ...data } = req.body;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (existing.sellerId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        images: true,
        category: true,
        specifications: true,
      },
    });

    res.json({ listing });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (existing.sellerId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellerListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.userId!;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = { sellerId };
    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get seller listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
