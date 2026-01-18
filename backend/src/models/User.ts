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
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @ManyToOne(() => Tenant, tenant => tenant.users)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ length: 255, select: false })
    passwordHash: string;

    @Column({ length: 255 })
    fullName: string;

    @Column({ length: 50 })
    role: 'super_admin' | 'tenant_admin' | 'auditor' | 'user' | 'consultant';

    @Column({ type: 'timestamp', nullable: true })
    lastLogin?: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    emailVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Métodos
    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.passwordHash);
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
