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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Audit_1 = require("./Audit");
const Document_1 = require("./Document");
const NonConformity_1 = require("./NonConformity");
const KPI_1 = require("./KPI");
const Risk_1 = require("./Risk");
const Category_1 = require("./Category");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Tenant.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "subdomain", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Tenant.prototype, "planType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "employeeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "onboardingCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Tenant.prototype, "employeesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 13, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "cuit", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "taxCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "billingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "ivaCondition", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, user => user.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Audit_1.Audit, audit => audit.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "audits", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Document_1.Document, document => document.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NonConformity_1.NonConformity, nc => nc.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "ncs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => KPI_1.KPI, kpi => kpi.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "kpis", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Risk_1.Risk, risk => risk.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "risks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Category_1.Category, category => category.tenant, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Tenant.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);
