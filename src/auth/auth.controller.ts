import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('send-otp')
  async sendOTP(@Body('mobile') mobile: string) {
    if (!mobile) throw new BadRequestException('Mobile number is required');
    return this.authService.sendOTP(mobile);
  }

  @Post('verify-otp')
  async verifyOTP(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    if (!mobile || !otp) throw new BadRequestException('Mobile and OTP are required');
    return this.authService.verifyOTP(mobile, otp);
  }

  @Post('register')
  async register(@Body() userData: any) {
    if (!userData.mobile) throw new BadRequestException('Mobile number is required for registration');

    let user = await this.userService.findByMobile(userData.mobile);
    if (!user) {
        user = await this.userService.createShellUser(userData.mobile);
    }

    console.log('Registering user data:', userData);

    // Explicitly mapping fields to ensure they match entity properties
    const updateData = {
        fullName: userData.fullName,
        fatherName: userData.fatherName,
        dob: userData.dob,
        gender: userData.gender,
        email: userData.email,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        pincode: userData.pincode,
        occupation: userData.occupation,
        collegeName: userData.collegeName,
        monthlyIncome: Number(userData.monthlyIncome) || 0,
        emergencyContact: userData.emergencyContact
    };

    await this.userService.update(user.id, updateData);

    // Return login response immediately after registration
    return this.authService.verifyOTP(userData.mobile, '123456');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    console.log('Fetching profile for:', user?.mobile, 'Name:', user?.fullName);
    return user;
  }
}
