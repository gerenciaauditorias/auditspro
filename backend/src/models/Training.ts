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

@Entity('trainings')
export class Training {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ length: 100, nullable: true })
    instructor: string;

    @Column({ type: 'jsonb', default: [] })
    attendees: string[]; // Array of User IDs or names

    @Column({ type: 'integer', default: 0 })
    durationHours: number;

    @Column({ length: 50, default: 'completed' })
    status: 'planned' | 'completed' | 'cancelled';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
