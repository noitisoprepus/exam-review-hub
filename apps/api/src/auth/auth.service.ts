import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { User } from 'prisma/generated/prisma/client';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(email: string, password: string): Promise<void> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await this.passwordService.hashPassword(password);

    await this.usersService.create({
      email: email,
      passwordHash: passwordHash,
    });
  }

  async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account is suspended');
    } else if (user.status === 'BANNED') {
      throw new ForbiddenException('Account is banned');
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateAndStoreRefreshToken(
      user.id,
      userAgent,
      ipAddress,
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revoke(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    const validToken = await this.refreshTokenService.findValid(refreshToken);
    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(validToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account is suspended');
    } else if (user.status === 'BANNED') {
      throw new ForbiddenException('Account is banned');
    }

    // Revoke old refresh token
    await this.refreshTokenService.revoke(refreshToken);

    const newAccessToken = this.generateAccessToken(user.id);
    const newRefreshToken = await this.generateAndStoreRefreshToken(
      user.id,
      validToken.userAgent ?? undefined,
      validToken.ipAddress ?? undefined,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: user,
    };
  }

  private generateAccessToken(userId: string): string {
    return this.jwtService.sign({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  private async generateAndStoreRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { userId, type: 'refresh' },
      { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.refreshTokenService.create(
      userId,
      refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
    );

    return refreshToken;
  }
}
