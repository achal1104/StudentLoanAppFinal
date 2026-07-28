import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async sendOTP(mobile: string) {
    // In a real app, integrate with Firebase Admin or Twilio here
    console.log(`Sending OTP 123456 to ${mobile}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(mobile: string, otp: string) {
    // Mock OTP verification
    if (otp !== '123456') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.userService.findByMobile(mobile);
    if (!user) {
      // If user doesn't exist, we'll need them to register
      // But for simple flow, we can create a shell user
      user = await this.userService.createShellUser(mobile);
    }

    const payload = { sub: user.id, mobile: user.mobile };
    return {
      token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
