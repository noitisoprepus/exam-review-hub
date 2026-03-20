import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Question, QuestionOption } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionDifficulty } from 'prisma/generated/prisma/enums';

type QuestionWithOptions = Question & { options: QuestionOption[] };

const QUESTION_VERSIONABLE_FIELDS = [
  'text',
  'options',
  'explanation',
  'correctOptionIndex',
] as const;

@Injectable()
export class ExamsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findQuestionById(id: string): Promise<QuestionWithOptions | null> {
    return this.prismaService.question.findUnique({
      where: { id },
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });
  }

  async findLatestQuestionByGroupId(
    groupId: string,
  ): Promise<QuestionWithOptions> {
    const latestVersion = await this.prismaService.question.findFirst({
      where: {
        OR: [{ id: groupId, groupId: null }, { groupId }],
        deletedAt: null,
      },
      orderBy: { version: 'desc' },
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });

    if (!latestVersion) {
      throw new NotFoundException('Question not found');
    }

    return latestVersion;
  }

  async findQuestionVersions(groupId: string): Promise<QuestionWithOptions[]> {
    return this.prismaService.question.findMany({
      where: {
        OR: [{ id: groupId }, { groupId }],
      },
      orderBy: { version: 'asc' },
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });
  }

  async findQuestionsByCreator(
    creatorId: string,
  ): Promise<QuestionWithOptions[]> {
    return this.prismaService.question.findMany({
      where: {
        creatorId,
        groupId: null,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });
  }

  async createQuestion(
    creatorId: string,
    data: {
      text: string;
      correctOptionIndex: number;
      explanation: string;
      difficulty: QuestionDifficulty;
      options: { optionIndex: number; text: string }[];
    },
  ): Promise<QuestionWithOptions> {
    return this.prismaService.question.create({
      data: {
        text: data.text,
        correctOptionIndex: data.correctOptionIndex,
        explanation: data.explanation,
        difficulty: data.difficulty,
        creatorId,
        options: {
          create: data.options,
        },
      },
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });
  }

  async updateQuestion(
    id: string,
    creatorId: string,
    data: {
      text?: string;
      correctOptionIndex?: number;
      explanation?: string;
      difficulty?: QuestionDifficulty;
      options?: { optionIndex: number; text: string }[];
    },
  ): Promise<QuestionWithOptions> {
    const existing = await this.prismaService.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existing) {
      throw new NotFoundException('Question not found');
    }

    if (existing.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this question');
    }

    if (existing.deletedAt) {
      throw new NotFoundException('Question has been deleted');
    }

    const hasVersionableChange = QUESTION_VERSIONABLE_FIELDS.some(
      (field) => data[field] !== undefined,
    );

    if (hasVersionableChange) {
      const updatedData = {
        text: data.text ?? existing.text,
        correctOptionIndex:
          data.correctOptionIndex ?? existing.correctOptionIndex,
        explanation: data.explanation ?? existing.explanation,
        difficulty: data.difficulty ?? existing.difficulty,
      };

      await this.prismaService.question.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return this.prismaService.question.create({
        data: {
          ...updatedData,
          creatorId: existing.creatorId,
          groupId: existing.groupId ?? existing.id,
          version: existing.version + 1,
          options: {
            create:
              data.options ??
              existing.options.map((o) => ({
                optionIndex: o.optionIndex,
                text: o.text,
              })),
          },
        },
        include: { options: { orderBy: { optionIndex: 'asc' } } },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.explanation !== undefined)
      updateData.explanation = data.explanation;

    if (data.options) {
      for (const opt of existing.options) {
        const newOpt = data.options.find(
          (o) => o.optionIndex === opt.optionIndex,
        );
        if (newOpt) {
          await this.prismaService.questionOption.update({
            where: { id: opt.id },
            data: { text: newOpt.text },
          });
        }
      }
    }

    return this.prismaService.question.update({
      where: { id },
      data: updateData,
      include: { options: { orderBy: { optionIndex: 'asc' } } },
    });
  }

  async deleteQuestionVersion(
    id: string,
    creatorId: string,
  ): Promise<Question> {
    const existing = await this.prismaService.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Question not found');
    }

    if (existing.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this question');
    }

    if (existing.deletedAt) {
      throw new NotFoundException('Question already deleted');
    }

    return this.prismaService.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async deleteQuestionGroup(
    groupId: string,
    creatorId: string,
  ): Promise<Question[]> {
    const rootQuestion = await this.findLatestQuestionByGroupId(groupId);

    if (rootQuestion.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this question');
    }

    const allVersions = await this.findQuestionVersions(groupId);

    return this.prismaService.$transaction(
      allVersions.map((q) =>
        this.prismaService.question.update({
          where: { id: q.id },
          data: { deletedAt: new Date() },
        }),
      ),
    );
  }
}
