import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { User } from './User';
import { Audit } from './Audit';
import { Document } from './Document';
import { NonConformity } from './NonConformity';
import { KPI } from './KPI';
import { Risk } from './Risk';


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

    // Subscription & Payment Info
    @Column({ type: 'timestamp', nullable: true })
    trialStartDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    trialEndsAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    billingStartDate?: Date;

    @Column({ type: 'varchar', length: 50, default: 'trial_active' })
    subscriptionStatus: 'trial_active' | 'trial_ending' | 'trial_ended_pending' | 'active' | 'suspended' | 'cancelled';

    @Column({ type: 'text', nullable: true, select: false }) // Don't expose this by default
    paymentMethodToken?: string;


    @OneToMany(() => User, user => user.tenant, { cascade: true, onDelete: 'CASCADE' })
    users: User[];

    @OneToMany(() => Audit, audit => audit.tenant, { cascade: true, onDelete: 'CASCADE' })
    audits: Audit[];

    @OneToMany(() => Document, document => document.tenant, { cascade: true, onDelete: 'CASCADE' })
    documents: Document[];

    @OneToMany(() => NonConformity, nc => nc.tenant, { cascade: true, onDelete: 'CASCADE' })
    ncs: NonConformity[];

    @OneToMany(() => KPI, kpi => kpi.tenant, { cascade: true, onDelete: 'CASCADE' })
    kpis: KPI[];

    @OneToMany(() => Risk, risk => risk.tenant, { cascade: true, onDelete: 'CASCADE' })
    risks: Risk[];

    @OneToMany(() => Risk, risk => risk.tenant, { cascade: true, onDelete: 'CASCADE' })
    risks: Risk[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
