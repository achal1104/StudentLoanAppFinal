import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { LoanModule } from '../loan/loan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), LoanModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
