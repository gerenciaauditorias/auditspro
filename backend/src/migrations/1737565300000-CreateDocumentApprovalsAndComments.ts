import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDocumentApprovalsAndComments1737565300000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create document_approvals table
        await queryRunner.createTable(
            new Table({
                name: "document_approvals",
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
                        name: "reviewerId",
                        type: "uuid",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "20",
                    },
                    {
                        name: "comments",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "reviewedAt",
                        type: "timestamp",
                        isNullable: true,
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
            "document_approvals",
            new TableForeignKey({
                columnNames: ["documentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "documents",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "document_approvals",
            new TableForeignKey({
                columnNames: ["reviewerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
            })
        );

        // Create document_comments table
        await queryRunner.createTable(
            new Table({
                name: "document_comments",
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
                        name: "content",
                        type: "text",
                    },
                    {
                        name: "parentCommentId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "document_comments",
            new TableForeignKey({
                columnNames: ["documentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "documents",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "document_comments",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
            })
        );

        await queryRunner.createForeignKey(
            "document_comments",
            new TableForeignKey({
                columnNames: ["parentCommentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "document_comments",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("document_comments");
        await queryRunner.dropTable("document_approvals");
    }
}
