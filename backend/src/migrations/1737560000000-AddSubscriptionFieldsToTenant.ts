import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSubscriptionFieldsToTenant1737560000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("tenants", [
            new TableColumn({
                name: "trialStartDate",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "trialEndsAt",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "billingStartDate",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "subscriptionStatus",
                type: "varchar",
                length: "50",
                default: "'trial_active'",
            }),
            new TableColumn({
                name: "paymentMethodToken",
                type: "text",
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("tenants", ["trialStartDate", "trialEndsAt", "billingStartDate", "subscriptionStatus", "paymentMethodToken"]);
    }

}
