import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByMobile(mobile: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { mobile } });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createShellUser(mobile: string): Promise<User> {
    const user = this.userRepository.create({ mobile });
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }
}
