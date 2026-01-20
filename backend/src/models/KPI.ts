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

@Entity('kpis')
export class KPI {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 100 })
    category: 'quality' | 'safety' | 'environment' | 'efficiency' | 'other';

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 50 })
    unit: string; // e.g., %, hours, count

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    targetValue: number;

    @Column({ length: 20, default: 'higher' })
    direction: 'higher' | 'lower'; // Is higher better or lower better?

    @Column({ type: 'jsonb', nullable: true })
    measurements: any[]; // Array of { date: string, value: number }

    @Column({ length: 50, default: 'monthly' })
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
