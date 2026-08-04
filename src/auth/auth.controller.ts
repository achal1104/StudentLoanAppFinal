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
    console.log('--- NEW REGISTRATION ATTEMPT ---');
    console.log('Payload Received:', JSON.stringify(userData));

    const mobile = userData.mobile || userData.phone;

    if (!mobile) {
        console.error('ERROR: No mobile number in payload. Keys:', Object.keys(userData));
        throw new BadRequestException('CRITICAL_ERROR: Mobile number missing in registration data');
    }

    try {
        let user = await this.userService.findByMobile(mobile);
        if (!user) {
            user = await this.userService.createShellUser(mobile);
            console.log('Created new shell user for:', mobile);
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

        await this.userService.update(user.id, updateData);
        console.log('SUCCESS: Profile updated for:', mobile);

        return this.authService.verifyOTP(mobile, '123456');

    } catch (error) {
        console.error('FAILED: Registration processing error ->', error.message);
        throw new BadRequestException('Registration Processing Failed: ' + error.message);
    }
  }

  @Get('admin/users')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-contacts')
  async syncContacts(@Request() req, @Body('contacts') contacts: any[]) {
    console.log(`Syncing ${contacts?.length || 0} contacts for user ${req.user.id}`);
    return this.userService.update(req.user.id, { contacts });
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-location')
  async syncLocation(@Request() req, @Body() location: { latitude: number; longitude: number; address?: string }) {
    return this.userService.update(req.user.id, {
      latitude: location.latitude,
      longitude: location.longitude,
      locationAddress: location.address
    });
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
