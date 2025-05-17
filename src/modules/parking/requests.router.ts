import { Router } from 'express';
import * as requestController from './requests.controller';
import { checkRole } from '../../middlewares/roles.middleware';

const router = Router();

router.post('/', requestController.createRequest);
router.get('/', requestController.getAllRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.put('/:id/status', checkRole(['ADMIN']), requestController.updateRequestStatus);
router.delete('/:id', requestController.deleteRequest);

export default router;