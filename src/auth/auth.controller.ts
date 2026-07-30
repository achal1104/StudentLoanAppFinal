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
    return this.authService.sendOTP(mobile);
  }

  @Post('verify-otp')
  async verifyOTP(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    if (!mobile || !otp) throw new BadRequestException('Mobile and OTP are required');
    return this.authService.verifyOTP(mobile, otp);
  }

  @Post('register')
  async register(@Body() userData: any) {
    console.log('--- REGISTRATION ATTEMPT ---');
    console.log('Raw Payload:', JSON.stringify(userData));

    if (!userData.mobile) {
        throw new BadRequestException('Mobile number is missing in registration data');
    }

    try {
        let user = await this.userService.findByMobile(userData.mobile);
        if (!user) {
            user = await this.userService.createShellUser(userData.mobile);
            console.log('Created new shell user for registration');
        } else {
            console.log('Found existing user for registration update');
        }

        const updateData = {
            fullName: userData.fullName || null,
            fatherName: userData.fatherName || null,
            dob: userData.dob || null,
            gender: userData.gender || null,
            email: userData.email || null,
            address: userData.address || null,
            city: userData.city || null,
            state: userData.state || null,
            pincode: userData.pincode || null,
            occupation: userData.occupation || null,
            collegeName: userData.collegeName || null,
            monthlyIncome: userData.monthlyIncome !== undefined ? Number(userData.monthlyIncome) : 0,
            emergencyContact: userData.emergencyContact || null
        };

        console.log('Mapped Update Data:', JSON.stringify(updateData));
        await this.userService.update(user.id, updateData);
        console.log('SUCCESS: User profile updated');

        // Verify with mock OTP to return a valid session
        return this.authService.verifyOTP(userData.mobile, '123456');

    } catch (error) {
        console.error('CRITICAL: Registration Error ->', error.message);
        throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() userData: any) {
    return this.userService.update(req.user.id, userData);
  }
}
