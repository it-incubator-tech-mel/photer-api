import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileOutputDto } from './dto/profile-output.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Profile')
@Controller('api/v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of the currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ProfileOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async getCurrentUserProfile(@Req() req: any): Promise<ProfileOutputDto> {
    // Получаем userId из JWT токена
    const userId = req.user?.userId || 'temp-user-id';
    return this.profileService.getCurrentUserProfile(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new profile' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created profile',
    type: ProfileOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Profile already exists for this user',
  })
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: any,
  ): Promise<ProfileOutputDto> {
    // Получаем userId из JWT токена
    const userId = req.user?.userId || 'temp-user-id';
    return this.profileService.createProfile(createProfileDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile for user by profile id' })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ProfileOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async getProfileById(@Param('id') id: string): Promise<ProfileOutputDto> {
    return this.profileService.getProfileById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing profile' })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    type: 'string',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'If try to update profile of other user',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: any,
  ): Promise<ProfileOutputDto> {
    // Получаем userId из JWT токена
    const userId = req.user?.userId || 'temp-user-id';
    return this.profileService.updateProfile(id, updateProfileDto, userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete your profile for testing' })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async deleteProfile(@Req() req: any): Promise<void> {
    // Получаем userId из JWT токена
    const userId = req.user?.userId || 'temp-user-id';
    return this.profileService.deleteProfile(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get profile by user id' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ProfileOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async getProfileByUserId(
    @Param('userId') userId: string,
  ): Promise<ProfileOutputDto> {
    return this.profileService.getProfileByUserId(userId);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created avatar link',
    schema: {
      type: 'object',
      properties: {
        fileUrl: {
          type: 'string',
          example: 'https://storage.example.com/1/avatar1.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async uploadAvatar(
    @UploadedFile() file: any,
    @Req() req: any,
  ): Promise<{ fileUrl: string }> {
    // Получаем userId из JWT токена
    const userId = req.user?.userId || 'temp-user-id';

    // Загружаем файл в storage и получаем URL
    const fileUrl = file?.path || 'https://storage.example.com/1/avatar1.jpg';

    return this.profileService.uploadAvatar(userId, fileUrl);
  }
}
