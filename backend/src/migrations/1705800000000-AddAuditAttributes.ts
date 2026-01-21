import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditAttributes1705800000000 implements MigrationInterface {
    name = 'AddAuditAttributes1705800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns to audits table
        await queryRunner.query(`ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "isoStandard" character varying`);
        await queryRunner.query(`ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "startDate" timestamp without time zone`);
        await queryRunner.query(`ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "endDate" timestamp without time zone`);
        await queryRunner.query(`ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "conclusions" text`);

        // Create audit_checklists table
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_checklists" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "auditId" uuid NOT NULL,
            "section" character varying NOT NULL,
            "question" text NOT NULL,
            "isCompliant" boolean,
            "auditorNotes" text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_audit_checklists" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`ALTER TABLE "audit_checklists" ADD CONSTRAINT "FK_audit_checklists_audit" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE`);

        // Create audit_responsibles table
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_responsibles" (
            "auditId" uuid NOT NULL,
            "userId" uuid NOT NULL,
            CONSTRAINT "PK_audit_responsibles" PRIMARY KEY ("auditId", "userId")
        )`);

        await queryRunner.query(`ALTER TABLE "audit_responsibles" ADD CONSTRAINT "FK_audit_responsibles_audit" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "audit_responsibles" ADD CONSTRAINT "FK_audit_responsibles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_responsibles" DROP CONSTRAINT "FK_audit_responsibles_user"`);
        await queryRunner.query(`ALTER TABLE "audit_responsibles" DROP CONSTRAINT "FK_audit_responsibles_audit"`);
        await queryRunner.query(`DROP TABLE "audit_responsibles"`);

        await queryRunner.query(`ALTER TABLE "audit_checklists" DROP CONSTRAINT "FK_audit_checklists_audit"`);
        await queryRunner.query(`DROP TABLE "audit_checklists"`);

        await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN "conclusions"`);
        await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN "isoStandard"`);
    }

}
