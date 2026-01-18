import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root API route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Auditorías en Línea API' });
});

// Import and use other routers here
import authRoutes from './auth';
import documentRoutes from './documents';
import tenantRoutes from './tenant';

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/tenant', tenantRoutes);

export default router;
