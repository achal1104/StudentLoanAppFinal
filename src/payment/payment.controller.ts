import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiate(@Request() req, @Body() data: any) {
    return this.paymentService.initiatePayment(req.user.id, data.loanId, data.amount, data.paymentMethod);
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.paymentService.getHistory(req.user.id);
  }
}
