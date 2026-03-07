import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { ProfilesService } from './profiles.service';

@Module({
  providers: [ProfilesService, PrismaService],
  exports: [ProfilesService],
  imports: [UsersModule],
})
export class ProfilesModule {}
