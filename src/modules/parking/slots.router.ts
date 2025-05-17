import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/roles.middleware';
import * as controller from './slots.controller';

const router = express.Router();

// Admin routes
router.post('/', authenticate, requireRoles(['ADMIN']), controller.createSlot);
router.post('/bulk', authenticate, requireRoles(['ADMIN']), controller.createBulkSlots);
router.put('/:id', authenticate, requireRoles(['ADMIN']), controller.updateSlot);
router.delete('/:id', authenticate, requireRoles(['ADMIN']), controller.deleteSlot);

// Regular routes that any authenticated user can access
router.get('/', authenticate, controller.getSlots);
router.get('/:id', authenticate, controller.getSlotById);

export default router;