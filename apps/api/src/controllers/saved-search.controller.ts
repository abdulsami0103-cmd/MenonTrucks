import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

export const createSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, filters, emailAlert = true } = req.body;
    const userId = req.userId!;

    const savedSearch = await prisma.savedSearch.create({
      data: {
        name,
        filters: JSON.stringify(filters),
        emailAlert,
        userId,
      },
    });

    res.status(201).json({ savedSearch });
  } catch (error) {
    console.error('Create saved search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSavedSearches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      savedSearches: savedSearches.map((s) => ({
        ...s,
        filters: JSON.parse(s.filters),
      })),
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, emailAlert } = req.body;
    const userId = req.userId!;

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Saved search not found' });
      return;
    }

    const savedSearch = await prisma.savedSearch.update({
      where: { id },
      data: { name, emailAlert },
    });

    res.json({ savedSearch });
  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Saved search not found' });
      return;
    }

    await prisma.savedSearch.delete({ where: { id } });
    res.json({ message: 'Saved search deleted' });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
