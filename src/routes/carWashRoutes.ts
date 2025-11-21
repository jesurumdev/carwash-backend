import { Router } from 'express';
import * as carWashController from '../controllers/carWashController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', carWashController.getAllCarWashes);
router.get('/:id', carWashController.getCarWashById);
router.post('/', authenticate, carWashController.createCarWash);
router.put('/:id', authenticate, carWashController.updateCarWash);
router.delete('/:id', authenticate, carWashController.deleteCarWash);

export default router;

