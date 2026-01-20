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

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ length: 255 })
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ length: 50, default: 'open' })
    status: 'open' | 'in_progress' | 'resolved' | 'closed';

    @Column({ length: 50, default: 'medium' })
    priority: 'low' | 'medium' | 'high' | 'urgent';

    @Column({ type: 'jsonb', default: [] })
    replies: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
