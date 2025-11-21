import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id/services', serviceController.getServicesByCarWashId);
router.get('/:id/services/:serviceId', serviceController.getServiceById);
router.post('/:id/services', authenticate, serviceController.createService);
router.put('/:id/services/:serviceId', authenticate, serviceController.updateService);
router.delete('/:id/services/:serviceId', authenticate, serviceController.deleteService);

export default router;

