import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AuthService implements OnModuleInit {
  private useFirebase = false;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        // Use Type Casting to avoid TS errors on some environments
        const firebaseAdmin = admin as any;
        if (firebaseAdmin.apps.length === 0) {
          firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccountPath),
          });
        }
        this.useFirebase = true;
        console.log('SUCCESS: Firebase Admin SDK initialized');
      } catch (error) {
        console.error('ERROR: Firebase initialization failed', error);
      }
    } else {
      console.warn('WARNING: firebase-service-account.json not found. Falling back to mock OTP 123456.');
    }
  }

  async sendOTP(mobile: string) {
    console.log(`OTP request for ${mobile}`);
    return { message: 'OTP request received' };
  }

  async verifyOTP(mobile: string, otp: string) {
    if (otp.length > 20 && this.useFirebase) {
      return this.verifyFirebaseToken(otp);
    }

    if (otp !== '123456') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.userService.findByMobile(mobile);
    if (!user) {
      user = await this.userService.createShellUser(mobile);
    }

    const payload = { sub: user.id, mobile: user.mobile };
    return {
      token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async verifyFirebaseToken(idToken: string) {
    try {
      const firebaseAdmin = admin as any;
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const mobile = decodedToken.phone_number?.replace('+91', '');

      if (!mobile) throw new UnauthorizedException('Phone number missing in Firebase token');

      let user = await this.userService.findByMobile(mobile);
      if (!user) {
        user = await this.userService.createShellUser(mobile);
      }

      const payload = { sub: user.id, mobile: user.mobile };
      return {
        token: this.jwtService.sign(payload),
        user: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Firebase authentication failed: ' + error.message);
    }
  }
}
