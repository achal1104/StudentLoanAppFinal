import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req) {
    return this.notificationService.getNotifications(req.user.id);
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationService.markRead(id);
  }
}
