import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordService } from './password.service';
import { UsersModule } from '@/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  providers: [AuthService, PasswordService, JwtStrategy, RefreshTokenService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
