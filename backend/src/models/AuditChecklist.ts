import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Audit } from './Audit';

@Entity('audit_checklists')
export class AuditChecklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    auditId: string;

    @ManyToOne(() => Audit, audit => audit.checklists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'auditId' })
    audit: Audit;

    @Column()
    section: string;

    @Column('text')
    question: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    status: 'compliant' | 'non_compliant' | 'observation' | 'improvement_opportunity' | null;

    @Column('text', { nullable: true })
    auditorNotes: string;

    @Column('jsonb', { nullable: true })
    evidence: Array<{
        type: 'image' | 'document' | 'audio';
        url: string;
        name: string;
        uploadedAt: string;
    }>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
