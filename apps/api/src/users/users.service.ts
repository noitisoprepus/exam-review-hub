import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, User } from '../../prisma/generated/prisma/client';
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findMany(
    skip?: number,
    take?: number,
    cursor?: Prisma.UserWhereUniqueInput,
    where?: Prisma.UserWhereInput,
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ): Promise<User[]> {
    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
