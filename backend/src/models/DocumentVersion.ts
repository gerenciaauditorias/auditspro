import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Document } from './Document';
import { User } from './User';

@Entity('document_versions')
export class DocumentVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    documentId: string;

    @ManyToOne(() => Document, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column({ length: 10 })
    version: string; // e.g., "1.0", "1.1", "2.0"

    @Column({ type: 'text', nullable: true })
    fileUrl: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    changes: string; // Description of what changed

    @Column()
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
