import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  getUserById,
  toggleUserSuspension,
  updateUserRole,
  deleteUser,
  getListingsForModeration,
  moderateListing,
  deleteListing,
  getAdminCategories,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// Dashboard
router.get('/stats', getAdminStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/suspend', toggleUserSuspension);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Listing moderation
router.get('/listings', getListingsForModeration);
router.patch('/listings/:id/moderate', moderateListing);
router.delete('/listings/:id', deleteListing);

// Category management (uses existing CRUD from category.routes, this is admin view)
router.get('/categories', getAdminCategories);

export default router;
