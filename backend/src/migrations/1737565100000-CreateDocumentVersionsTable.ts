import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDocumentVersionsTable1737565100000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "document_versions",
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
                        name: "version",
                        type: "varchar",
                        length: "10",
                    },
                    {
                        name: "fileUrl",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "changes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdById",
                        type: "uuid",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "document_versions",
            new TableForeignKey({
                columnNames: ["documentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "documents",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "document_versions",
            new TableForeignKey({
                columnNames: ["createdById"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("document_versions");
    }
}
