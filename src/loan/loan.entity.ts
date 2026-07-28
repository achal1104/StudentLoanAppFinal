import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  REPAID = 'REPAID',
  CLOSED = 'CLOSED',
  OVERDUE = 'OVERDUE',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loanAmount: number;

  @Column()
  tenureDays: number;

  @Column()
  repaymentAmount: number;

  @Column({ default: LoanStatus.PENDING })
  status: LoanStatus;

  @CreateDateColumn()
  appliedAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ nullable: true })
  disbursedAt: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  repaidAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ default: false })
  agreementAccepted: boolean;

  @Column({ nullable: true })
  agreementAcceptedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  disbursementReference: string;

  @ManyToOne(() => User, (user) => user.loans)
  user: User;
}
