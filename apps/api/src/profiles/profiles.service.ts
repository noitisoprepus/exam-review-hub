import { Injectable } from '@nestjs/common';
import {
  CreatorProfile,
  Prisma,
  UserProfile,
} from '../../prisma/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prismaService: PrismaService) {}

  // UserProfile

  async findUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    return this.prismaService.userProfile.findUnique({
      where: { userId },
    });
  }

  async findUserProfileByUsername(
    username: string,
  ): Promise<UserProfile | null> {
    return this.prismaService.userProfile.findUnique({
      where: { username },
    });
  }

  async createUserProfile(
    data: Prisma.UserProfileCreateInput,
  ): Promise<UserProfile> {
    return this.prismaService.userProfile.create({ data });
  }

  async updateUserProfile(
    userId: string,
    data: Prisma.UserProfileUpdateInput,
  ): Promise<UserProfile> {
    return this.prismaService.userProfile.update({
      where: { userId },
      data,
    });
  }

  // CreatorProfile

  findCreatorProfileByUserId(userId: string): Promise<CreatorProfile | null> {
    return this.prismaService.creatorProfile.findUnique({
      where: { userId },
    });
  }

  async createCreatorProfile(
    data: Prisma.CreatorProfileCreateInput,
  ): Promise<CreatorProfile> {
    return this.prismaService.creatorProfile.create({ data });
  }

  async updateCreatorProfile(
    userId: string,
    data: Prisma.CreatorProfileUpdateInput,
  ): Promise<CreatorProfile> {
    return this.prismaService.creatorProfile.update({
      where: { userId },
      data,
    });
  }
}
