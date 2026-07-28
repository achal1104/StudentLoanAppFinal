import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './loan.entity';
import { User, KycStatus } from '../user/user.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getEligibility(userId: string) {
    // Force reload user from DB to get latest KYC status
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user.kycStatus !== KycStatus.VERIFIED) {
      return {
        eligible: false,
        reason: 'KYC not verified',
        maxLoanAmount: 1100,
        tenureDays: 15,
        repaymentAmount: 1150,
        completedCycles: user.completedLoanCycles,
        requiredCyclesForUpgrade: 4,
      };
    }

    // Check for active loans
    const activeLoan = await this.loanRepository.findOne({
      where: [
        { user: { id: userId }, status: LoanStatus.PENDING },
        { user: { id: userId }, status: LoanStatus.APPROVED },
        { user: { id: userId }, status: LoanStatus.DISBURSED },
        { user: { id: userId }, status: LoanStatus.OVERDUE },
      ],
    });

    if (activeLoan) {
      return {
        eligible: false,
        reason: 'You have an active loan',
        maxLoanAmount: user.currentLoanEligibility,
        tenureDays: 15,
        repaymentAmount: Math.floor(user.currentLoanEligibility * 1.045),
        completedCycles: user.completedLoanCycles,
        requiredCyclesForUpgrade: 4,
      };
    }

    return {
      eligible: true,
      maxLoanAmount: user.currentLoanEligibility,
      tenureDays: 15,
      repaymentAmount: Math.floor(user.currentLoanEligibility * 1.045),
      completedCycles: user.completedLoanCycles,
      requiredCyclesForUpgrade: 4,
      nextUpgradeAmount: 2200,
    };
  }

  async applyLoan(userId: string, amount: number) {
    const eligibility = await this.getEligibility(userId);
    if (!eligibility.eligible) {
      throw new BadRequestException(eligibility.reason);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const loan = this.loanRepository.create({
      user,
      loanAmount: amount,
      tenureDays: eligibility.tenureDays,
      repaymentAmount: eligibility.repaymentAmount,
      status: LoanStatus.DISBURSED,
      appliedAt: new Date(),
      approvedAt: new Date(),
      disbursedAt: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    return this.loanRepository.save(loan);
  }

  async repayLoan(loanId: string) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user']
    });

    if (!loan) throw new NotFoundException('Loan not found');

    loan.status = LoanStatus.CLOSED;
    loan.repaidAt = new Date();
    loan.closedAt = new Date();
    await this.loanRepository.save(loan);

    const user = loan.user;
    user.completedLoanCycles += 1;
    if (user.completedLoanCycles >= 4 && user.currentLoanEligibility === 1100) {
      user.currentLoanEligibility = 2200;
    }
    await this.userRepository.save(user);
    return loan;
  }
}
