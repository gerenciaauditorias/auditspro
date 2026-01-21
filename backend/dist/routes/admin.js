"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
// All routes require Super Admin role
router.use(auth_1.authenticate);
router.use((0, rbac_1.requireRole)(['super_admin']));
// Tenant Management
router.get('/tenants', adminController_1.getAllTenants);
router.delete('/tenants/:id', adminController_1.deleteTenant);
// System Configuration
router.get('/config', adminController_1.getSystemConfig);
router.patch('/config', adminController_1.updateSystemConfig);
router.post('/config/test-smtp', adminController_1.testSMTP);
exports.default = router;
