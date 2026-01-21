import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ConfigCategory {
    SMTP = 'smtp',
    GENERAL = 'general',
    SECURITY = 'security'
}

@Entity('system_configs')
export class SystemConfig {
    @PrimaryColumn()
    key: string;

    @Column('text')
    value: string;

    @Column({
        type: 'varchar', // Use varchar instead of enum for better compatibility with SQLite/Postgres hybrid setups if needed
        default: 'general'
    })
    category: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    isSecret: boolean; // If true, value shouldn't be returned in plain text to frontend unless necessary

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
