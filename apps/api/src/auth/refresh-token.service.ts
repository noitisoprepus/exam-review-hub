import { Injectable } from '@nestjs/common';
import { RefreshToken } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RefreshToken> {
    const tokenHash = await argon2.hash(token);

    return this.prismaService.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });
  }

  async findValid(token: string): Promise<RefreshToken | null> {
    const tokens = await this.prismaService.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
    });

    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, token)) {
        return t;
      }
    }

    return null;
  }

  async revoke(token: string): Promise<void> {
    const validToken = await this.findValid(token);
    if (validToken) {
      await this.prismaService.refreshToken.update({
        where: { id: validToken.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { userId: userId },
      data: { revokedAt: new Date() },
    });
  }
}
