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

    @Column({ nullable: true })
    isCompliant: boolean;

    @Column('text', { nullable: true })
    auditorNotes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
