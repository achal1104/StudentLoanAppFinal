import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(userId: string) {
    return this.notificationRepository.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    await this.notificationRepository.update(id, { read: true });
  }
}
