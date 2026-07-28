import { Controller, Get, Post, Body, UseGuards, Request, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  async getStatus(@Request() req) {
    return this.kycService.getStatus(req.user.id);
  }

  @Post('upload-aadhaar')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]))
  async uploadAadhaar(@Request() req, @UploadedFiles() files: { front?: Express.Multer.File[], back?: Express.Multer.File[] }) {
    // In a real app, save files to S3/Firebase and pass URLs
    const frontUrl = 'mock_aadhaar_front_url';
    const backUrl = 'mock_aadhaar_back_url';
    return this.kycService.uploadAadhaar(req.user.id, frontUrl, backUrl);
  }

  @Post('upload-pan')
  @UseInterceptors(FileInterceptor('pan'))
  async uploadPAN(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const panUrl = 'mock_pan_url';
    return this.kycService.uploadPAN(req.user.id, panUrl);
  }

  @Post('upload-selfie')
  @UseInterceptors(FileInterceptor('selfie'))
  async uploadSelfie(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const selfieUrl = 'mock_selfie_url';
    return this.kycService.uploadSelfie(req.user.id, selfieUrl);
  }

  @Post('submit-bank-details')
  async submitBankDetails(@Request() req, @Body() details: any) {
    return this.kycService.submitBankDetails(req.user.id, details);
  }

  @Post('live-verification')
  async submitLiveVerification(@Request() req, @Body() data: any) {
    return this.kycService.submitLiveVerification(req.user.id, data);
  }
}
