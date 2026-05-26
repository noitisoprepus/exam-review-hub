import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ExamAttempt,
  UserAnswer,
  Exam,
  Question,
  QuestionOption,
  ExamQuestion,
} from '../../prisma/generated/prisma/client';
import {
  ExamAttemptResponseDto,
  AttemptSummaryDto,
  AttemptResultDto,
  UserAnswerResponseDto,
} from './dto/attempt-response.dto';

type ExamWithQuestions = Exam & {
  examQuestions: (ExamQuestion & {
    question: Question & { options: QuestionOption[] };
  })[];
};

type AttemptWithRelations = ExamAttempt & {
  exam: Exam;
  answers: (UserAnswer & {
    question: Question & { options: QuestionOption[] };
  })[];
};

// const EXAM_VERSIONABLE_FIELDS = [
//   'title',
//   'targetExamId',
//   'examQuestions',
// ] as const;

@Injectable()
export class AttemptsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findLatestExamByGroupId(
    groupId: string,
  ): Promise<ExamWithQuestions> {
    const latestVersion = await this.prismaService.exam.findFirst({
      where: {
        OR: [{ id: groupId, groupId: null }, { groupId }],
        deletedAt: null,
        publishedAt: { not: null },
      },
      orderBy: { version: 'desc' },
      include: {
        examQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            question: {
              include: { options: { orderBy: { optionIndex: 'asc' } } },
            },
          },
        },
      },
    });

    if (!latestVersion) {
      throw new NotFoundException('Exam not found or not published');
    }

    return latestVersion as ExamWithQuestions;
  }

  private calculateScore(
    answers: UserAnswer[],
    totalQuestions: number,
  ): number {
    if (totalQuestions === 0) return 0;
    const correctCount = answers.filter((a) => a.isCorrect === true).length;
    return Math.round((correctCount / totalQuestions) * 100);
  }

  private mapAnswerToDto(answer: UserAnswer): UserAnswerResponseDto {
    return {
      id: answer.id,
      questionId: answer.questionId,
      selectedIndex: answer.selectedIndex,
      isCorrect: answer.isCorrect,
      answeredAt: answer.answeredAt,
    };
  }

  private mapToResponseDto(
    attempt: AttemptWithRelations,
  ): ExamAttemptResponseDto {
    return {
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      examVersion: attempt.examVersion,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers.map((a) => this.mapAnswerToDto(a)),
      isSubmitted: attempt.submittedAt !== null,
    };
  }

  async startAttempt(
    userId: string,
    examId: string,
  ): Promise<ExamAttemptResponseDto> {
    const exam = await this.findLatestExamByGroupId(examId);

    const attempt = await this.prismaService.examAttempt.create({
      data: {
        userId,
        examId: exam.id,
        examVersion: exam.version,
        startedAt: new Date(),
      },
      include: {
        exam: true,
        answers: true,
      },
    });

    return this.mapToResponseDto(attempt as AttemptWithRelations);
  }

  async getAttemptsByUser(userId: string): Promise<AttemptSummaryDto[]> {
    const attempts = await this.prismaService.examAttempt.findMany({
      where: { userId },
      include: { exam: true },
      orderBy: { startedAt: 'desc' },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      examVersion: attempt.examVersion,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    }));
  }

  async getAttemptById(
    attemptId: string,
    userId: string,
  ): Promise<ExamAttemptResponseDto> {
    const attempt = await this.prismaService.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt');
    }

    return this.mapToResponseDto(attempt as AttemptWithRelations);
  }

  async submitAnswer(
    attemptId: string,
    userId: string,
    questionId: string,
    selectedIndex: number,
  ): Promise<UserAnswerResponseDto> {
    const attempt = await this.prismaService.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: { include: { options: true } } },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt');
    }

    if (attempt.submittedAt) {
      throw new BadRequestException('Attempt has already been submitted');
    }

    const examQuestion = attempt.exam.examQuestions.find(
      (eq) => eq.questionId === questionId,
    );

    if (!examQuestion) {
      throw new NotFoundException('Question not found in this exam');
    }

    const existingAnswer = attempt.answers.find(
      (a) => a.questionId === questionId,
    );
    if (existingAnswer) {
      throw new BadRequestException(
        'Answer already submitted for this question',
      );
    }

    const question = examQuestion.question as Question & {
      options: QuestionOption[];
    };

    if (selectedIndex < 0 || selectedIndex >= question.options.length) {
      throw new BadRequestException('Invalid option index');
    }

    const isCorrect = question.correctOptionIndex === selectedIndex;

    const answer = await this.prismaService.userAnswer.create({
      data: {
        attemptId,
        questionId,
        selectedIndex,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    return this.mapAnswerToDto(answer);
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
  ): Promise<ExamAttemptResponseDto> {
    const attempt = await this.prismaService.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: { include: { question: true } },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt');
    }

    if (attempt.submittedAt) {
      throw new BadRequestException('Attempt has already been submitted');
    }

    const totalQuestions = attempt.exam.examQuestions.length;
    const score = this.calculateScore(attempt.answers, totalQuestions);

    const updatedAttempt = await this.prismaService.examAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score,
      },
      include: {
        exam: true,
        answers: true,
      },
    });

    return this.mapToResponseDto(updatedAttempt as AttemptWithRelations);
  }

  async getResults(
    attemptId: string,
    userId: string,
  ): Promise<AttemptResultDto> {
    const attempt = await this.prismaService.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                question: {
                  include: { options: { orderBy: { optionIndex: 'asc' } } },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt');
    }

    if (!attempt.submittedAt) {
      throw new BadRequestException('Attempt has not been submitted yet');
    }

    const questions = attempt.exam.examQuestions.map((eq) => {
      const question = eq.question as Question & { options: QuestionOption[] };
      const userAnswer = attempt.answers.find(
        (a) => a.questionId === question.id,
      );

      return {
        questionId: question.id,
        text: question.text,
        options: question.options.map((o) => o.text),
        correctIndex: question.correctOptionIndex ?? -1,
        userSelectedIndex: userAnswer?.selectedIndex ?? null,
        isCorrect: userAnswer?.isCorrect ?? false,
      };
    });

    const correctAnswers = questions.filter((q) => q.isCorrect).length;

    return {
      attemptId: attempt.id,
      examTitle: attempt.exam.title,
      totalQuestions: questions.length,
      correctAnswers,
      score: attempt.score ?? 0,
      questions,
    };
  }
}
