import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ProfilesService } from './profiles.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
