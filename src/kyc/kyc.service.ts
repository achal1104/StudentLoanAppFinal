import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc } from './kyc.entity';
import { User, KycStatus } from '../user/user.entity';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStatus(userId: string) {
    const kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (kyc) {
        await this.checkAndUpdateKycStatus(userId);
    }
    return kyc;
  }

  async uploadAadhaar(userId: string, front: string, back: string) {
    let kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (!kyc) {
      kyc = this.kycRepository.create({ user: { id: userId } as User });
    }
    kyc.aadhaarFront = front;
    kyc.aadhaarBack = back;
    kyc.aadhaarVerified = true;

    const saved = await this.kycRepository.save(kyc);
    await this.checkAndUpdateKycStatus(userId);
    return saved;
  }

  async uploadPAN(userId: string, front: string) {
    let kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (!kyc) {
      kyc = this.kycRepository.create({ user: { id: userId } as User });
    }
    kyc.panFront = front;
    kyc.panVerified = true;

    const saved = await this.kycRepository.save(kyc);
    await this.checkAndUpdateKycStatus(userId);
    return saved;
  }

  async uploadSelfie(userId: string, selfie: string) {
    let kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (!kyc) {
      kyc = this.kycRepository.create({ user: { id: userId } as User });
    }
    kyc.selfie = selfie;
    kyc.selfieVerified = true;

    const saved = await this.kycRepository.save(kyc);
    await this.checkAndUpdateKycStatus(userId);
    return saved;
  }

  async submitBankDetails(userId: string, details: any) {
    let kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (!kyc) {
      kyc = this.kycRepository.create({ user: { id: userId } as User });
    }
    kyc.accountHolderName = details.accountHolderName;
    kyc.accountNumber = details.accountNumber;
    kyc.ifsc = details.ifsc;
    kyc.bankName = details.bankName;
    kyc.upiId = details.upiId;
    kyc.bankDetailsVerified = true;

    const saved = await this.kycRepository.save(kyc);
    await this.checkAndUpdateKycStatus(userId);
    return saved;
  }

  async submitLiveVerification(userId: string, data: any) {
    let kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (!kyc) {
      kyc = this.kycRepository.create({ user: { id: userId } as User });
    }
    kyc.liveVerified = true;
    await this.kycRepository.save(kyc);
    await this.checkAndUpdateKycStatus(userId);
    return kyc;
  }

  private async checkAndUpdateKycStatus(userId: string) {
    const kyc = await this.kycRepository.findOne({ where: { user: { id: userId } } });
    if (kyc && kyc.aadhaarVerified && kyc.panVerified && kyc.selfieVerified && kyc.bankDetailsVerified) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user && user.kycStatus !== KycStatus.VERIFIED) {
          user.kycStatus = KycStatus.VERIFIED;
          await this.userRepository.save(user);
          console.log(`User ${userId} KYC Status updated to VERIFIED`);
      }
    }
  }
}
