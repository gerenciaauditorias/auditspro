import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, inviteUser } from '../controllers/userController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';
import { requireTenantAdmin } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getUsers);
router.post('/', requireTenantAdmin, createUser);
router.patch('/:id', requireTenantAdmin, updateUser);
router.delete('/:id', requireTenantAdmin, deleteUser);
router.post('/invite', requireTenantAdmin, inviteUser);

export default router;
