import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

export enum NotificationType {
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  LOAN_DISBURSED = 'LOAN_DISBURSED',
  DUE_TOMORROW = 'DUE_TOMORROW',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  LOAN_CLOSED = 'LOAN_CLOSED',
  LOAN_UPGRADED = 'LOAN_UPGRADED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;
}
