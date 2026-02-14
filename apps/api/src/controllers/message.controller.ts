import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, listingId, content } = req.body;
    const senderId = req.userId!;

    if (senderId === receiverId) {
      res.status(400).json({ error: 'Cannot message yourself' });
      return;
    }

    const message = await prisma.message.create({
      data: { senderId, receiverId, listingId, content },
      include: {
        sender: { select: { id: true, name: true, avatar: true, companyName: true } },
        listing: { select: { id: true, title: true, slug: true } },
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get unique conversations (grouped by the other user)
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const contactIds = new Set([
      ...sent.map((m) => m.receiverId),
      ...received.map((m) => m.senderId),
    ]);

    const conversations = await Promise.all(
      Array.from(contactIds).map(async (contactId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: contactId },
              { senderId: contactId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            listing: { select: { id: true, title: true, slug: true } },
          },
        });

        const contact = await prisma.user.findUnique({
          where: { id: contactId },
          select: { id: true, name: true, avatar: true, companyName: true },
        });

        const unreadCount = await prisma.message.count({
          where: { senderId: contactId, receiverId: userId, status: 'UNREAD' },
        });

        return { contact, lastMessage, unreadCount };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) =>
      new Date(b.lastMessage?.createdAt || 0).getTime() - new Date(a.lastMessage?.createdAt || 0).getTime()
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { contactId } = req.params;
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: contactId },
            { senderId: contactId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          listing: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: contactId },
            { senderId: contactId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { senderId: contactId, receiverId: userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });

    res.json({
      messages: messages.reverse(),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.userId!, status: 'UNREAD' },
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
