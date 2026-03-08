import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ProfilesService } from './profiles.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ProfilesService],
  exports: [ProfilesService],
  imports: [UsersModule, PrismaModule],
})
export class ProfilesModule {}
