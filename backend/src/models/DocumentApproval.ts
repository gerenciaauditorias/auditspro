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

@Entity('document_approvals')
export class DocumentApproval {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    documentId: string;

    @ManyToOne(() => Document, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column()
    reviewerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reviewerId' })
    reviewer: User;

    @Column({ length: 20 })
    status: 'pending' | 'approved' | 'rejected';

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
