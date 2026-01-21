"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChecklistStatusAndEvidence1737423600000 = void 0;
class UpdateChecklistStatusAndEvidence1737423600000 {
    async up(queryRunner) {
        // Add new status column
        await queryRunner.query(`
            ALTER TABLE "audit_checklists" 
            ADD COLUMN "status" VARCHAR(50)
        `);
        // Migrate existing data: isCompliant true -> 'compliant', false -> 'non_compliant', null -> null
        await queryRunner.query(`
            UPDATE "audit_checklists" 
            SET "status" = CASE 
                WHEN "isCompliant" = true THEN 'compliant'
                WHEN "isCompliant" = false THEN 'non_compliant'
                ELSE NULL
            END
        `);
        // Add evidence column
        await queryRunner.query(`
            ALTER TABLE "audit_checklists" 
            ADD COLUMN "evidence" JSONB
        `);
        // Drop old isCompliant column (optional - can keep for rollback safety)
        // await queryRunner.query(`ALTER TABLE "audit_checklists" DROP COLUMN "isCompliant"`);
    }
    async down(queryRunner) {
        // Restore isCompliant column
        await queryRunner.query(`
            ALTER TABLE "audit_checklists" 
            ADD COLUMN "isCompliant" BOOLEAN
        `);
        // Migrate back
        await queryRunner.query(`
            UPDATE "audit_checklists" 
            SET "isCompliant" = CASE 
                WHEN "status" = 'compliant' THEN true
                WHEN "status" = 'non_compliant' THEN false
                ELSE NULL
            END
        `);
        // Drop new columns
        await queryRunner.query(`ALTER TABLE "audit_checklists" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "audit_checklists" DROP COLUMN "evidence"`);
    }
}
exports.UpdateChecklistStatusAndEvidence1737423600000 = UpdateChecklistStatusAndEvidence1737423600000;
