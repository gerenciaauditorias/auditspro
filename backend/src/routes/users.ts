import { Router } from 'express';
import { getUsers, inviteUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUsers);
router.post('/invite', inviteUser);

export default router;
