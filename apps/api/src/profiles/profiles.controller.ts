import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { JwtDto } from '@/auth/dto/jwt.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateCreatorProfileDto } from './dto/create-creator-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CreatorProfileResponseDto } from './dto/creator-profile-response.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

@ApiTags('Profiles')
@Controller()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  //////////////////////
  // Public endpoints //
  //////////////////////

  // TODO: Validate passed username
  @Get('u/:username')
  async getProfileByUsername(@Param('username') username: string): Promise<{
    userProfile: UserProfileResponseDto;
    creatorProfile: CreatorProfileResponseDto | null;
  }> {
    const userProfile =
      await this.profilesService.findUserProfileByUsername(username);

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const creatorProfile =
      await this.profilesService.findCreatorProfileByUserId(userProfile.userId);

    return { userProfile, creatorProfile };
  }

  /////////////////////////////
  // Authenticated endpoints //
  /////////////////////////////

  // UserProfile

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile/me')
  async getMyUserProfile(
    @CurrentUser() user: JwtDto,
  ): Promise<UserProfileResponseDto | null> {
    return this.profilesService.findUserProfileByUserId(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('profile/me')
  async createMyUserProfile(
    @CurrentUser() user: JwtDto,
    @Body() dto: CreateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const existing = await this.profilesService.findUserProfileByUserId(
      user.sub,
    );

    if (existing) {
      return existing;
    }

    return this.profilesService.createUserProfile({
      username: dto.username,
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
      user: { connect: { id: user.sub } },
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('profile/me')
  async updateMyUserProfile(
    @CurrentUser() user: JwtDto,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.profilesService.findUserProfileByUserId(
      user.sub,
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return this.profilesService.updateUserProfile(profile.id, dto);
  }

  // CreatorProfile

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile/me/creator')
  async getMyCreatorProfile(
    @CurrentUser() user: JwtDto,
  ): Promise<CreatorProfileResponseDto | null> {
    return this.profilesService.findCreatorProfileByUserId(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('profile/me/creator')
  async createMyCreatorProfile(
    @CurrentUser() user: JwtDto,
    @Body() dto: CreateCreatorProfileDto,
  ): Promise<CreatorProfileResponseDto> {
    const existing = await this.profilesService.findCreatorProfileByUserId(
      user.sub,
    );

    if (existing) {
      return existing;
    }

    return this.profilesService.createCreatorProfile({
      creatorType: dto.creatorType,
      user: { connect: { id: user.sub } },
    });
  }
}
