import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('kyc')
export class Kyc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  aadhaarFront: string;

  @Column({ nullable: true })
  aadhaarBack: string;

  @Column({ default: false })
  aadhaarVerified: Boolean;

  @Column({ nullable: true })
  panFront: string;

  @Column({ default: false })
  panVerified: Boolean;

  @Column({ nullable: true })
  selfie: string;

  @Column({ default: false })
  selfieVerified: Boolean;

  @Column({ nullable: true })
  accountHolderName: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  ifsc: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  upiId: string;

  @Column({ default: false })
  bankDetailsVerified: Boolean;

  @Column({ default: false })
  liveVerified: Boolean;

  @OneToOne(() => User, (user) => user.kyc)
  @JoinColumn()
  user: User;
}
