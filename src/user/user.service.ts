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
    // Find the latest record for this mobile to handle potential duplicates during migration
    return this.userRepository.findOne({
      where: { mobile },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createShellUser(mobile: string): Promise<User> {
    // Double check uniqueness before creation
    const existing = await this.findByMobile(mobile);
    if (existing) return existing;

    const user = this.userRepository.create({ mobile });
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
        console.error(`[USER SERVICE] Update failed: User ${id} not found`);
        return null;
    }

    console.log(`[USER SERVICE] Updating user ${id} with fields:`, Object.keys(userData));

    // Explicitly merge to avoid overwriting with nulls if partial data is sent
    if (userData.fullName) user.fullName = userData.fullName;
    if (userData.contacts) user.contacts = userData.contacts;
    if (userData.latitude) user.latitude = userData.latitude;
    if (userData.longitude) user.longitude = userData.longitude;
    if (userData.locationAddress) user.locationAddress = userData.locationAddress;

    // For other fields
    Object.assign(user, userData);

    const savedUser = await this.userRepository.save(user);
    console.log(`[USER SERVICE] Save successful for user ${id}`);
    return savedUser;
  }
}
