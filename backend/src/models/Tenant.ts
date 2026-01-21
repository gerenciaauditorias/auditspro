import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { User } from './User';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    companyName: string;

    @Column({ length: 100, unique: true })
    subdomain: string;

    @Column({ length: 50 })
    planType: 'starter' | 'professional' | 'enterprise';

    @Column({ default: 'active' })
    status: 'active' | 'suspended' | 'cancelled';

    @Column({ nullable: true })
    logoUrl?: string;

    @Column({ nullable: true })
    industry?: string;

    @Column({ nullable: true })
    employeeCount?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ default: false })
    onboardingCompleted: boolean;

    @Column({ type: 'int', nullable: true })
    employeesCount?: number;

    // Fiscal Information (Argentina)
    @Column({ length: 13, nullable: true })
    cuit?: string;

    @Column({ length: 50, nullable: true })
    taxCondition?: 'responsable_inscripto' | 'monotributo' | 'exento' | 'consumidor_final';

    @Column({ type: 'text', nullable: true })
    billingAddress?: string;

    @Column({ length: 50, nullable: true })
    ivaCondition?: 'responsable_inscripto' | 'exento' | 'no_responsable';

    @OneToMany(() => User, user => user.tenant)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
