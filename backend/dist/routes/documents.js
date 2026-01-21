"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentController_1 = require("../controllers/documentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.use(auth_1.authenticate);
router.use(auth_1.ensureTenantIsolation);
// Basic CRUD
router.get('/', documentController_1.getDocuments);
router.post('/', documentController_1.createDocument);
router.get('/:id', documentController_1.getDocumentById);
router.put('/:id', documentController_1.updateDocument);
// Workflow
router.post('/:id/request-approval', documentController_1.requestApproval);
router.post('/:id/approve', documentController_1.approveDocument);
exports.default = router;
