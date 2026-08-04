import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Kyc } from '../kyc/kyc.entity';
import { Loan } from '../loan/loan.entity';

export enum KycStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  fatherName: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  email: string;

  @Column({ unique: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  collegeName: string;

  @Column({ default: 0 })
  monthlyIncome: number;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ default: KycStatus.PENDING })
  kycStatus: KycStatus;

  @Column({ default: 0 })
  completedLoanCycles: number;

  @Column({ default: 1100 })
  currentLoanEligibility: number;

  @Column({ type: 'jsonb', nullable: true })
  contacts: { name: string; phone: string }[];

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Kyc, (kyc) => kyc.user)
  kyc: Kyc;

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];
}
