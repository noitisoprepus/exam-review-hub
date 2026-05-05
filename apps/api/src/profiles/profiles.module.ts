import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { ProfilesService } from './profiles.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
