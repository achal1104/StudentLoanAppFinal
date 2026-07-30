import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { LoanService } from '../loan/loan.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private loanService: LoanService,
  ) {}

  async initiatePayment(userId: string, loanId: string, amount: number, method: any) {
    console.log(`--- INITIATING PAYMENT ---`);
    console.log(`User: ${userId}, Loan: ${loanId}, Method: ${method}, Amount: ${amount}`);

    const payment = this.paymentRepository.create({
      user: { id: userId } as any,
      loanId,
      amount,
      paymentMethod: method,
      status: PaymentStatus.PENDING,
    });
    const saved = await this.paymentRepository.save(payment);

    // LOGIC: For MVP/Test, we treat all methods as successful.
    // In production, Stripe or PayPal would return a URL here.
    if (method === 'Stripe' || method === 'PayPal') {
        console.log(`Foreign Payment Gateway (${method}) Simulation Triggered`);
    }

    return this.processCallback(saved.id, `txn_${Date.now()}`, 'SUCCESS');
  }

  async processCallback(paymentId: string, txnId: string, status: string) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (status === 'SUCCESS') {
      payment.status = PaymentStatus.SUCCESS;
      payment.transactionId = txnId;
      await this.paymentRepository.save(payment);

      console.log(`SUCCESS: Payment ${paymentId} completed via ${payment.paymentMethod}`);

      // Update loan status
      if (payment.loanId) {
        await this.loanService.repayLoan(payment.loanId);
      }
    }
    return payment;
  }

  async getHistory(userId: string) {
    return this.paymentRepository.find({ where: { user: { id: userId } }, order: { paidAt: 'DESC' } });
  }
}
