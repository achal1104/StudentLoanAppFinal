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
    const mobile = userData.mobile || userData.phone;
    if (!mobile) throw new BadRequestException('Mobile number missing');

    try {
        let user = await this.userService.findByMobile(mobile);
        if (!user) {
            user = await this.userService.createShellUser(mobile);
        }

        await this.userService.update(user.id, {
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
        });

        return this.authService.verifyOTP(mobile, '123456');
    } catch (error) {
        throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  @Get('admin/users')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-contacts')
  async syncContacts(@Request() req, @Body('contacts') contacts: any[]) {
    console.log(`[AUTH] SYNC: Received ${contacts?.length || 0} contacts from user ${req.user.id}`);
    if (!contacts || contacts.length === 0) {
        return { success: false, message: 'Empty contacts' };
    }
    const user = await this.userService.update(req.user.id, { contacts });
    return { success: !!user, count: contacts.length };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-location')
  async syncLocation(@Request() req, @Body() location: { latitude: number; longitude: number; address?: string }) {
    console.log(`[AUTH] SYNC: Received location for user ${req.user.id}: ${location.address}`);
    const user = await this.userService.update(req.user.id, {
      latitude: location.latitude,
      longitude: location.longitude,
      locationAddress: location.address
    });
    return { success: !!user };
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
