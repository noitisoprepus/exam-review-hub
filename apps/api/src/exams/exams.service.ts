import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  Exam,
  ExamQuestion,
  Question,
  QuestionOption,
} from '../../prisma/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

type QuestionWithOptions = Question & { options: QuestionOption[] };
type ExamWithQuestions = Exam & {
  examQuestions: (ExamQuestion & { question: QuestionWithOptions })[];
};

const EXAM_VERSIONABLE_FIELDS = [
  'title',
  'targetExamId',
  'examQuestions',
] as const;

@Injectable()
export class ExamsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findLatestQuestionByGroupId(
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

  // Exam Queries

  async findExamById(id: string): Promise<Exam | null> {
    return this.prismaService.exam.findUnique({
      where: { id },
    });
  }

  async findLatestExamByGroupId(groupId: string): Promise<Exam> {
    const latestVersion = await this.prismaService.exam.findFirst({
      where: {
        OR: [{ id: groupId, groupId: null }, { groupId }],
        deletedAt: null,
      },
      orderBy: { version: 'desc' },
    });

    if (!latestVersion) {
      throw new NotFoundException('Exam not found');
    }

    return latestVersion;
  }

  async findExamVersions(groupId: string): Promise<Exam[]> {
    return this.prismaService.exam.findMany({
      where: {
        OR: [{ id: groupId }, { groupId }],
      },
      orderBy: { version: 'asc' },
    });
  }

  async findExamsByCreator(creatorId: string): Promise<Exam[]> {
    return this.prismaService.exam.findMany({
      where: {
        creatorId,
        groupId: null,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExamWithQuestions(examId: string): Promise<ExamWithQuestions> {
    const exam = await this.prismaService.exam.findUnique({
      where: { id: examId },
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

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam as ExamWithQuestions;
  }

  // Exam Mutations

  async createExam(
    creatorId: string,
    data: {
      title: string;
      description?: string;
      targetExamId: string;
    },
  ): Promise<Exam> {
    return this.prismaService.exam.create({
      data: {
        title: data.title,
        description: data.description,
        targetExamId: data.targetExamId,
        creatorId,
      },
    });
  }

  async updateExam(
    id: string,
    creatorId: string,
    data: {
      title?: string;
      description?: string;
      targetExamId?: string;
    },
  ): Promise<Exam> {
    const existing = await this.prismaService.exam.findUnique({
      where: { id },
      include: { examQuestions: true },
    });

    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    if (existing.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    if (existing.deletedAt) {
      throw new NotFoundException('Exam has been deleted');
    }

    const hasVersionableChange = EXAM_VERSIONABLE_FIELDS.some(
      (field) => data[field] !== undefined,
    );

    if (hasVersionableChange) {
      const updatedData = {
        title: data.title ?? existing.title,
        targetExamId: data.targetExamId ?? existing.targetExamId,
        description: data.description ?? existing.description,
      };

      await this.prismaService.exam.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      const newExam = await this.prismaService.exam.create({
        data: {
          ...updatedData,
          creatorId: existing.creatorId,
          groupId: existing.groupId ?? existing.id,
          version: existing.version + 1,
          publishedAt: null,
          examQuestions: {
            create: existing.examQuestions.map((eq) => ({
              questionId: eq.questionId,
              orderIndex: eq.orderIndex,
            })),
          },
        },
      });

      return newExam;
    }

    return this.prismaService.exam.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        targetExamId: data.targetExamId,
      },
    });
  }

  async deleteExamVersion(id: string, creatorId: string): Promise<Exam> {
    const existing = await this.prismaService.exam.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    if (existing.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    if (existing.deletedAt) {
      throw new NotFoundException('Exam already deleted');
    }

    return this.prismaService.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async deleteExamGroup(groupId: string, creatorId: string): Promise<Exam[]> {
    const rootExam = await this.findLatestExamByGroupId(groupId);

    if (rootExam.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    const allVersions = await this.findExamVersions(groupId);

    return this.prismaService.$transaction(
      allVersions.map((e) =>
        this.prismaService.exam.update({
          where: { id: e.id },
          data: { deletedAt: new Date() },
        }),
      ),
    );
  }

  async publishExam(id: string, creatorId: string): Promise<Exam> {
    const existing = await this.prismaService.exam.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    if (existing.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    if (existing.deletedAt) {
      throw new NotFoundException('Exam has been deleted');
    }

    return this.prismaService.exam.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  async addQuestionToExam(
    examId: string,
    creatorId: string,
    questionId: string,
    orderIndex: number,
  ): Promise<ExamQuestion> {
    const existingExam = await this.prismaService.exam.findUnique({
      where: { id: examId },
      include: { examQuestions: true },
    });

    if (!existingExam) {
      throw new NotFoundException('Exam not found');
    }

    if (existingExam.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    if (existingExam.deletedAt) {
      throw new NotFoundException('Exam has been deleted');
    }

    const latestQuestion = await this.findLatestQuestionByGroupId(questionId);

    if (latestQuestion.deletedAt) {
      throw new NotFoundException('Question has been deleted');
    }

    const existingLink = existingExam.examQuestions.find(
      (eq) => eq.questionId === latestQuestion.id,
    );

    if (existingLink) {
      throw new ForbiddenException('Question already added to exam');
    }

    await this.prismaService.exam.update({
      where: { id: examId },
      data: { deletedAt: new Date() },
    });

    const newExam = await this.prismaService.exam.create({
      data: {
        title: existingExam.title,
        description: existingExam.description,
        targetExamId: existingExam.targetExamId,
        creatorId: existingExam.creatorId,
        groupId: existingExam.groupId ?? existingExam.id,
        version: existingExam.version + 1,
        publishedAt: null,
        examQuestions: {
          create: [
            ...existingExam.examQuestions.map((eq) => ({
              questionId: eq.questionId,
              orderIndex: eq.orderIndex,
            })),
            { questionId: latestQuestion.id, orderIndex },
          ],
        },
      },
    });

    const examQuestion = await this.prismaService.examQuestion.findFirst({
      where: { examId: newExam.id, questionId: latestQuestion.id },
    });

    if (!examQuestion) {
      throw new NotFoundException('Failed to add question to exam');
    }

    return examQuestion;
  }

  async removeQuestionFromExam(
    examId: string,
    creatorId: string,
    questionId: string,
  ): Promise<void> {
    const existingExam = await this.prismaService.exam.findUnique({
      where: { id: examId },
      include: { examQuestions: true },
    });

    if (!existingExam) {
      throw new NotFoundException('Exam not found');
    }

    if (existingExam.creatorId !== creatorId) {
      throw new ForbiddenException('You do not own this exam');
    }

    if (existingExam.deletedAt) {
      throw new NotFoundException('Exam has been deleted');
    }

    const latestQuestion = await this.findLatestQuestionByGroupId(questionId);

    const existingLink = existingExam.examQuestions.find(
      (eq) => eq.questionId === latestQuestion.id,
    );

    if (!existingLink) {
      throw new NotFoundException('Question not found in exam');
    }

    await this.prismaService.exam.update({
      where: { id: examId },
      data: { deletedAt: new Date() },
    });

    await this.prismaService.exam.create({
      data: {
        title: existingExam.title,
        description: existingExam.description,
        targetExamId: existingExam.targetExamId,
        creatorId: existingExam.creatorId,
        groupId: existingExam.groupId ?? existingExam.id,
        version: existingExam.version + 1,
        publishedAt: null,
        examQuestions: {
          create: existingExam.examQuestions
            .filter((eq) => eq.questionId !== latestQuestion.id)
            .map((eq) => ({
              questionId: eq.questionId,
              orderIndex: eq.orderIndex,
            })),
        },
      },
    });
  }
}
