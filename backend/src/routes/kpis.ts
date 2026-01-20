import { Router } from 'express';
import {
    createKPI,
    getKPIs,
    addMeasurement
} from '../controllers/kpiController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getKPIs);
router.post('/', createKPI);
router.post('/:id/measurements', addMeasurement);

export default router;
