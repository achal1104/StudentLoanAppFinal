import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  UPI = 'UPI',
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
  GPAY = 'GPAY',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column({ default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column()
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  paidAt: Date;

  @Column({ nullable: true })
  loanId: string;

  @ManyToOne(() => User)
  user: User;
}
