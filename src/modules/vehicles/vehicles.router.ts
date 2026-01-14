import { Router } from 'express';
import * as vehicleController from './vehicles.controller';
import { checkRole } from '../../middlewares/roles.middleware';

const router = Router();

router.post('/', vehicleController.createVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
