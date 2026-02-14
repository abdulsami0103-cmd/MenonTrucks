import { Router } from 'express';
import { sendMessage, getConversations, getMessages, getUnreadCount } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/:contactId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;
