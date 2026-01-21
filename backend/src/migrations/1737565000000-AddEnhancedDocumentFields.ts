import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEnhancedDocumentFields1737565000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("documents", [
            new TableColumn({
                name: "category",
                type: "varchar",
                length: "100",
                isNullable: true,
            }),
            new TableColumn({
                name: "area",
                type: "varchar",
                length: "100",
                isNullable: true,
            }),
            new TableColumn({
                name: "responsibleUserId",
                type: "uuid",
                isNullable: true,
            }),
            new TableColumn({
                name: "confidentialityLevel",
                type: "varchar",
                length: "20",
                default: "'internal'",
            }),
            new TableColumn({
                name: "description",
                type: "text",
                isNullable: true,
            }),
            new TableColumn({
                name: "tags",
                type: "text",
                isNullable: true,
            }),
            new TableColumn({
                name: "requiresApproval",
                type: "boolean",
                default: false,
            }),
            new TableColumn({
                name: "isCritical",
                type: "boolean",
                default: false,
            }),
            new TableColumn({
                name: "appliesToAudits",
                type: "boolean",
                default: false,
            }),
            new TableColumn({
                name: "nextReviewDate",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "reviewFrequencyMonths",
                type: "int",
                isNullable: true,
            }),
            new TableColumn({
                name: "isLatestVersion",
                type: "boolean",
                default: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("documents", [
            "category",
            "area",
            "responsibleUserId",
            "confidentialityLevel",
            "description",
            "tags",
            "requiresApproval",
            "isCritical",
            "appliesToAudits",
            "nextReviewDate",
            "reviewFrequencyMonths",
            "isLatestVersion"
        ]);
    }
}
