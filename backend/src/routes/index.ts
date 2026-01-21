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
import auditRoutes from './audits';
import ncRoutes from './ncs';
import kpiRoutes from './kpis';
import riskRoutes from './risks';
import userRoutes from './users';
import adminRoutes from './admin';

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/tenant', tenantRoutes);
router.use('/audits', auditRoutes);
router.use('/ncs', ncRoutes);
router.use('/kpis', kpiRoutes);
router.use('/risks', riskRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
