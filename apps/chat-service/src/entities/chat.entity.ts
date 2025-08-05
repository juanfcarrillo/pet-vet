import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group'
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @Column({ type: 'varchar', length: 100, name: 'sender_name' })
  senderName: string;

  @Column({ type: 'varchar', length: 50, name: 'sender_role' })
  senderRole: string;

  @Column({ type: 'uuid', name: 'recipient_id', nullable: true })
  recipientId?: string;

  @Column({ type: 'varchar', length: 100, name: 'recipient_name', nullable: true })
  recipientName?: string;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column({ type: 'varchar', length: 100, name: 'conversation_id' })
  conversationId: string;

  @Column({ 
    type: 'enum', 
    enum: ConversationType,
    default: ConversationType.PRIVATE
  })
  type: ConversationType;

  @Column({ 
    type: 'enum', 
    enum: MessageStatus,
    default: MessageStatus.SENT
  })
  status: MessageStatus;

  @Column({ type: 'boolean', default: false, name: 'is_edited' })
  isEdited: boolean;

  @Column({ type: 'timestamp', name: 'edited_at', nullable: true })
  editedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
