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

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async findByMobile(mobile: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { mobile } });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createShellUser(mobile: string): Promise<User> {
    const existing = await this.findByMobile(mobile);
    if (existing) return existing;

    const user = this.userRepository.create({ mobile });
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) return null;

    // Explicitly merge only the fields provided in the update
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        user[key] = userData[key];
      }
    });

    return this.userRepository.save(user);
  }
}
