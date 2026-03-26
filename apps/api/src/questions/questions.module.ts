import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [QuestionsService],
  controllers: [QuestionsController],
  imports: [PrismaModule],
})
export class QuestionsModule {}
