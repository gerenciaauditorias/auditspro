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

@Entity('audits')
export class Audit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    title: string;

    @Column({ length: 50, default: 'internal' })
    type: 'internal' | 'external' | 'supplier';

    @Column({ length: 50, default: 'scheduled' })
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

    @Column({ type: 'timestamp' })
    plannedDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    actualDate: Date;

    @Column({ nullable: true })
    leadAuditorId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'leadAuditorId' })
    leadAuditor: User;

    @Column({ type: 'text', nullable: true })
    scope: string;

    @Column({ type: 'text', nullable: true })
    objectives: string;

    @Column({ type: 'jsonb', nullable: true })
    checklist: any;

    @Column({ type: 'jsonb', nullable: true })
    findings: any;

    @Column({ type: 'text', nullable: true })
    conclusions: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
