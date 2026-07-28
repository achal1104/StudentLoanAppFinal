import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoanModule } from './loan/loan.module';
import { KycModule } from './kyc/kyc.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { User } from './user/user.entity';
import { Kyc } from './kyc/kyc.entity';
import { Loan } from './loan/loan.entity';
import { Payment } from './payment/payment.entity';
import { Notification } from './notification/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          // PostgreSQL for Render
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Kyc, Loan, Payment, Notification],
            synchronize: true, // Auto-create tables (Good for MVP)
            ssl: { rejectUnauthorized: false }, // Required for Render Postgres
          };
        } else {
          // Local SQLite
          return {
            type: 'sqlite',
            database: 'database.sqlite',
            entities: [User, Kyc, Loan, Payment, Notification],
            synchronize: true,
          };
        }
      },
    }),
    AuthModule,
    UserModule,
    LoanModule,
    KycModule,
    PaymentModule,
    NotificationModule,
  ],
})
export class AppModule {}
