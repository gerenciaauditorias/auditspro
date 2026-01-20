import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Tenant } from './Tenant';
import { User } from './User';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    uploadedById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploadedById' })
    uploadedBy: User;

    @Column({ length: 255 })
    fileName: string;

    @Column({ length: 255 })
    originalName: string;

    @Column({ length: 100 })
    mimeType: string;

    @Column({ type: 'bigint' })
    size: number;

    @Column({ length: 255 })
    storageKey: string;

    @Column({ length: 50, nullable: true })
    type: 'manual' | 'procedure' | 'instruction' | 'format' | 'record' | 'other';

    @Column({ length: 50, nullable: true, unique: true })
    code: string;

    @Column({ default: 1 })
    version: number;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ length: 50, default: 'draft' })
    status: 'draft' | 'under_review' | 'approved' | 'obsolete';

    @Column({ nullable: true })
    approvedById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'approvedById' })
    approvedBy: User;

    @Column({ type: 'timestamp', nullable: true })
    approvalDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
