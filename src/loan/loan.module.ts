import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, User])],
  providers: [LoanService],
  controllers: [LoanController],
  exports: [LoanService],
})
export class LoanModule {}
