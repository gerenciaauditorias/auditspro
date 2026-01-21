import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class CreateDocumentPermissionsTable1737565200000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "document_permissions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "documentId",
                        type: "uuid",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                    },
                    {
                        name: "permission",
                        type: "varchar",
                        length: "20",
                    },
                    {
                        name: "grantedById",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "grantedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "document_permissions",
            new TableForeignKey({
                columnNames: ["documentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "documents",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "document_permissions",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "document_permissions",
            new TableForeignKey({
                columnNames: ["grantedById"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
            })
        );

        await queryRunner.createUniqueConstraint(
            "document_permissions",
            new TableUnique({
                columnNames: ["documentId", "userId"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("document_permissions");
    }
}
