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

@Entity('equipment')
export class Equipment {
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
    serialNumber: string;

    @Column({ length: 100, nullable: true })
    model: string;

    @Column({ length: 100, nullable: true })
    location: string;

    @Column({ type: 'timestamp', nullable: true })
    lastCalibrationDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextCalibrationDate: Date;

    @Column({ length: 50, default: 'active' })
    status: 'active' | 'maintenance' | 'out_of_service' | 'calibrating';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
