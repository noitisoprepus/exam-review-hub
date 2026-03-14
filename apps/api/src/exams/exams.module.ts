import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ExamsService],
  controllers: [ExamsController],
  imports: [PrismaModule],
})
export class ExamsModule {}
