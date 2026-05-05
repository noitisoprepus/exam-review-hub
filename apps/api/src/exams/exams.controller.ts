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
import { ExamsService } from './exams.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { JwtDto } from '@/auth/dto/jwt.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { AddQuestionToExamDto } from './dto/add-question.dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  // Authenticated endpoints

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getMyExams(@CurrentUser() user: JwtDto) {
    return this.examsService.findExamsByCreator(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getExamById(@Param('id') id: string) {
    return this.examsService.findExamById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/latest')
  async getLatestExam(@Param('id') id: string) {
    return this.examsService.findLatestExamByGroupId(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/versions')
  async getExamVersions(@Param('id') id: string) {
    return this.examsService.findExamVersions(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/questions')
  async getExamWithQuestions(@Param('id') id: string) {
    return this.examsService.findExamWithQuestions(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createExam(@CurrentUser() user: JwtDto, @Body() dto: CreateExamDto) {
    return this.examsService.createExam(user.sub, {
      title: dto.title,
      description: dto.description,
      targetExamId: dto.targetExamId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async updateExam(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.updateExam(id, user.sub, {
      title: dto.title,
      description: dto.description,
      targetExamId: dto.targetExamId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteExamVersion(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
  ) {
    return this.examsService.deleteExamVersion(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/group')
  async deleteExamGroup(@Param('id') id: string, @CurrentUser() user: JwtDto) {
    return this.examsService.deleteExamGroup(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/publish')
  async publishExam(@Param('id') id: string, @CurrentUser() user: JwtDto) {
    return this.examsService.publishExam(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/questions')
  async addQuestionToExam(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
    @Body() dto: AddQuestionToExamDto,
  ) {
    return this.examsService.addQuestionToExam(
      id,
      user.sub,
      dto.questionId,
      dto.orderIndex,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/questions/:questionId')
  async removeQuestionFromExam(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: JwtDto,
  ) {
    return this.examsService.removeQuestionFromExam(id, user.sub, questionId);
  }
}
