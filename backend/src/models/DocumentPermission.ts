import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm';
import { Document } from './Document';
import { User } from './User';

@Entity('document_permissions')
@Unique(['documentId', 'userId'])
export class DocumentPermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    documentId: string;

    @ManyToOne(() => Document, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 20 })
    permission: 'read' | 'write' | 'approve';

    @Column({ nullable: true })
    grantedById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'grantedById' })
    grantedBy: User;

    @CreateDateColumn()
    grantedAt: Date;
}
