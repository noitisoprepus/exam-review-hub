import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { JwtDto } from '@/auth/dto/jwt.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // Authenticated endpoints

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getMyQuestions(@CurrentUser() user: JwtDto) {
    return this.questionsService.findQuestionsByCreator(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsService.findQuestionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/latest')
  async getLatestQuestion(@Param('id') id: string) {
    return this.questionsService.findLatestQuestionByGroupId(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/versions')
  async getQuestionVersions(@Param('id') id: string) {
    return this.questionsService.findQuestionVersions(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createQuestion(
    @CurrentUser() user: JwtDto,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.createQuestion(user.sub, {
      text: dto.text,
      correctOptionIndex: dto.correctOptionIndex,
      explanation: dto.explanation,
      difficulty: dto.difficulty,
      options: dto.options.map((o) => ({
        optionIndex: o.optionIndex,
        text: o.text,
      })),
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async updateQuestion(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.updateQuestion(id, user.sub, {
      text: dto.text,
      correctOptionIndex: dto.correctOptionIndex,
      explanation: dto.explanation,
      difficulty: dto.difficulty,
      options: dto.options?.map((o) => ({
        optionIndex: o.optionIndex,
        text: o.text,
      })),
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteQuestionVersion(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
  ) {
    return this.questionsService.deleteQuestionVersion(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/group')
  async deleteQuestionGroup(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
  ) {
    return this.questionsService.deleteQuestionGroup(id, user.sub);
  }
}
