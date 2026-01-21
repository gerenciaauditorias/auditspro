"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Root API route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Auditorías en Línea API' });
});
// Import and use other routers here
const auth_1 = __importDefault(require("./auth"));
const documents_1 = __importDefault(require("./documents"));
const tenant_1 = __importDefault(require("./tenant"));
const audits_1 = __importDefault(require("./audits"));
const ncs_1 = __importDefault(require("./ncs"));
const kpis_1 = __importDefault(require("./kpis"));
const risks_1 = __importDefault(require("./risks"));
const users_1 = __importDefault(require("./users"));
const admin_1 = __importDefault(require("./admin"));
router.use('/auth', auth_1.default);
router.use('/documents', documents_1.default);
router.use('/tenant', tenant_1.default);
router.use('/audits', audits_1.default);
router.use('/ncs', ncs_1.default);
router.use('/kpis', kpis_1.default);
router.use('/risks', risks_1.default);
router.use('/users', users_1.default);
router.use('/admin', admin_1.default);
exports.default = router;
