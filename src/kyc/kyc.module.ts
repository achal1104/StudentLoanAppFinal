import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kyc } from './kyc.entity';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc, User]), UserModule],
  providers: [KycService],
  controllers: [KycController],
})
export class KycModule {}
