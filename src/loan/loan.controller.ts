import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('loan')
@UseGuards(JwtAuthGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('eligibility')
  async getEligibility(@Request() req) {
    return this.loanService.getEligibility(req.user.id);
  }

  @Post('apply')
  async applyLoan(@Request() req, @Body('loanAmount') amount: number) {
    return this.loanService.applyLoan(req.user.id, amount);
  }

  @Get('current')
  async getCurrentLoan(@Request() req) {
    return this.loanService.getCurrentLoan(req.user.id);
  }

  @Get('history')
  async getLoanHistory(@Request() req) {
    return this.loanService.getLoanHistory(req.user.id);
  }

  @Post('accept-agreement')
  async acceptAgreement(@Request() req, @Body('loanId') loanId: string) {
    // In a real app, you'd update the loan record to mark agreement as accepted
    return { success: true };
  }
}
