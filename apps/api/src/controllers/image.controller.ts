import { Request, Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

export const addImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const { images } = req.body; // Array of { url, thumbnailUrl, altText, order }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.sellerId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const created = await prisma.image.createMany({
      data: images.map((img: any, index: number) => ({
        listingId,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        altText: img.altText,
        order: img.order ?? index,
        width: img.width,
        height: img.height,
        size: img.size,
      })),
    });

    const allImages = await prisma.image.findMany({
      where: { listingId },
      orderBy: { order: 'asc' },
    });

    res.status(201).json({ images: allImages, count: created.count });
  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await prisma.image.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    if (image.listing.sellerId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // TODO: Delete from S3/R2 storage

    await prisma.image.delete({ where: { id } });

    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reorderImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const { imageIds } = req.body; // Ordered array of image IDs

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.sellerId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Update order for each image
    await Promise.all(
      imageIds.map((imageId: string, index: number) =>
        prisma.image.update({
          where: { id: imageId },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Images reordered' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
