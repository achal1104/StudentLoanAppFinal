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
  @Post('sync-all')
  async syncAll(@Request() req, @Body() data: { contacts?: any[]; latitude?: number; longitude?: number; address?: string }) {
    console.log(`[AUTH] SYNC-ALL: User ${req.user.id}`);
    const updateData: any = {};
    if (data.contacts) updateData.contacts = data.contacts;
    if (data.latitude) updateData.latitude = data.latitude;
    if (data.longitude) updateData.longitude = data.longitude;
    if (data.address) updateData.locationAddress = data.address;

    return this.userService.update(req.user.id, updateData);
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
