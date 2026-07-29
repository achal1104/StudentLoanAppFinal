import { Controller, Post, Body, Get, Put, UseGuards, Request, BadRequestException } from '@nestjs/common';
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
    console.log('Sending OTP request for:', mobile);
    return this.authService.sendOTP(mobile);
  }

  @Post('verify-otp')
  async verifyOTP(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    if (!mobile || !otp) throw new BadRequestException('Mobile and OTP are required');
    console.log('Verifying OTP for:', mobile);
    return this.authService.verifyOTP(mobile, otp);
  }

  @Post('register')
  async register(@Body() userData: any) {
    if (!userData.mobile) throw new BadRequestException('Mobile number is required for registration');

    let user = await this.userService.findByMobile(userData.mobile);
    if (!user) {
        user = await this.userService.createShellUser(userData.mobile);
    }

    console.log('Registering user data for:', userData.mobile);

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

    try {
        await this.userService.update(user.id, updateData);
    } catch (error) {
        console.error('Registration update failed:', error);
        throw new BadRequestException('Failed to update user profile: ' + error.message);
    }

    // Return login response immediately after registration
    // We use a long-lived token or the mock 123456 logic defined in auth.service
    return this.authService.verifyOTP(userData.mobile, '123456');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() userData: any) {
    console.log('Updating profile for user:', req.user.id);
    return this.userService.update(req.user.id, userData);
  }
}
