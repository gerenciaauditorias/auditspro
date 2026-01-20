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

@Entity('risks')
export class Risk {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    description: string;

    @Column({ type: 'integer' })
    probability: number; // 1 to 5

    @Column({ type: 'integer' })
    impact: number; // 1 to 5

    @Column({ type: 'text', nullable: true })
    mitigationPlan: string;

    @Column({ length: 50, default: 'active' })
    status: 'active' | 'mitigated' | 'closed';

    @Column({ length: 100, nullable: true })
    category: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
