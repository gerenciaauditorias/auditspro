import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Document } from './Document';
import { User } from './User';

@Entity('document_comments')
export class DocumentComment {
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

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    parentCommentId: string;

    @ManyToOne(() => DocumentComment, { nullable: true })
    @JoinColumn({ name: 'parentCommentId' })
    parentComment: DocumentComment;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
