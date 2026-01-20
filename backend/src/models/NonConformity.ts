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
import { Audit } from './Audit';

@Entity('non_conformities')
export class NonConformity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ length: 50, default: 'audit' })
    source: 'audit' | 'process' | 'customer' | 'other';

    @Column({ nullable: true })
    auditId: string;

    @ManyToOne(() => Audit)
    @JoinColumn({ name: 'auditId' })
    audit: Audit;

    @Column({ length: 50, default: 'open' })
    status: 'open' | 'analysis' | 'action_plan' | 'verification' | 'closed';

    @Column({ length: 50, default: 'medium' })
    severity: 'low' | 'medium' | 'high' | 'critical';

    @Column({ nullable: true })
    assignedToId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User;

    @Column({ type: 'jsonb', nullable: true })
    rootCauseAnalysis: any; // { method: '5whys', data: [] }

    @Column({ type: 'jsonb', nullable: true })
    correctiveActions: any[];

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    closedDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
