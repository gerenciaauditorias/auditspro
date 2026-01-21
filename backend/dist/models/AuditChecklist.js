"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditChecklist = void 0;
const typeorm_1 = require("typeorm");
const Audit_1 = require("./Audit");
let AuditChecklist = class AuditChecklist {
};
exports.AuditChecklist = AuditChecklist;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditChecklist.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditChecklist.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Audit_1.Audit, audit => audit.checklists, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'auditId' }),
    __metadata("design:type", Audit_1.Audit)
], AuditChecklist.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditChecklist.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], AuditChecklist.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", Object)
], AuditChecklist.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AuditChecklist.prototype, "auditorNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], AuditChecklist.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuditChecklist.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AuditChecklist.prototype, "updatedAt", void 0);
exports.AuditChecklist = AuditChecklist = __decorate([
    (0, typeorm_1.Entity)('audit_checklists')
], AuditChecklist);
