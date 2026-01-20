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

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 100, nullable: true })
    taxId: string;

    @Column({ length: 255, nullable: true })
    contactEmail: string;

    @Column({ length: 50, default: 'active' })
    status: 'active' | 'inactive' | 'pending_evaluation';

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number; // 0.00 to 5.00

    @Column({ type: 'jsonb', nullable: true })
    evaluations: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
