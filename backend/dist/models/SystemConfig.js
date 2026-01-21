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
exports.SystemConfig = exports.ConfigCategory = void 0;
const typeorm_1 = require("typeorm");
var ConfigCategory;
(function (ConfigCategory) {
    ConfigCategory["SMTP"] = "smtp";
    ConfigCategory["GENERAL"] = "general";
    ConfigCategory["SECURITY"] = "security";
})(ConfigCategory || (exports.ConfigCategory = ConfigCategory = {}));
let SystemConfig = class SystemConfig {
};
exports.SystemConfig = SystemConfig;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], SystemConfig.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], SystemConfig.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar', // Use varchar instead of enum for better compatibility with SQLite/Postgres hybrid setups if needed
        default: 'general'
    }),
    __metadata("design:type", String)
], SystemConfig.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SystemConfig.prototype, "isSecret", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SystemConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SystemConfig.prototype, "updatedAt", void 0);
exports.SystemConfig = SystemConfig = __decorate([
    (0, typeorm_1.Entity)('system_configs')
], SystemConfig);
