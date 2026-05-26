import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { JwtDto } from '@/auth/dto/jwt.dto';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('Attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private attemptsService: AttemptsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async startAttempt(
    @CurrentUser() user: JwtDto,
    @Body() dto: StartAttemptDto,
  ) {
    return this.attemptsService.startAttempt(user.sub, dto.examId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getMyAttempts(@CurrentUser() user: JwtDto) {
    return this.attemptsService.getAttemptsByUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getAttemptById(@Param('id') id: string, @CurrentUser() user: JwtDto) {
    return this.attemptsService.getAttemptById(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/answers')
  async submitAnswer(
    @Param('id') id: string,
    @CurrentUser() user: JwtDto,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.attemptsService.submitAnswer(
      id,
      user.sub,
      dto.questionId,
      dto.selectedIndex,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/submit')
  async submitAttempt(@Param('id') id: string, @CurrentUser() user: JwtDto) {
    return this.attemptsService.submitAttempt(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/results')
  async getResults(@Param('id') id: string, @CurrentUser() user: JwtDto) {
    return this.attemptsService.getResults(id, user.sub);
  }
}
