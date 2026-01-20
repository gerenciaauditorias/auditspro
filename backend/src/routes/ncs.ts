import { Router } from 'express';
import {
    createNC,
    getNCs,
    updateNC
} from '../controllers/ncController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getNCs);
router.post('/', createNC);
router.patch('/:id', updateNC);

export default router;
