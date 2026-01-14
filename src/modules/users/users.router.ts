import { Router } from 'express';
import * as userController from './users.controller';
import { checkRole } from '../../middlewares/roles.middleware';

const router = Router();

// Admin routes
router.get('/', checkRole(['ADMIN']), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', checkRole(['ADMIN']), userController.updateUser);
router.delete('/:id', checkRole(['ADMIN']), userController.deleteUser);

// User profile routes (available to all authenticated users)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;
