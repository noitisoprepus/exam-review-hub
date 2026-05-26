import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ type: () => [String], description: 'Option texts' })
  options: string[];

  @ApiProperty({ description: 'Correct option index', nullable: true })
  correctIndex: number | null;
}

export class UserAnswerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionId: string;

  @ApiProperty()
  selectedIndex: number | null;

  @ApiProperty()
  isCorrect: boolean | null;

  @ApiProperty()
  answeredAt: Date;
}

export class ExamAttemptResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  examId: string;

  @ApiProperty()
  examTitle: string;

  @ApiProperty()
  examVersion: number;

  @ApiProperty({ description: 'Score as percentage (0-100)', nullable: true })
  score: number | null;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ type: () => [UserAnswerResponseDto] })
  answers: UserAnswerResponseDto[];

  @ApiProperty({ description: 'Whether the attempt has been submitted' })
  isSubmitted: boolean;
}

export class AttemptSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  examId: string;

  @ApiProperty()
  examTitle: string;

  @ApiProperty()
  examVersion: number;

  @ApiProperty({ nullable: true })
  score: number | null;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;
}

export class AttemptResultDto {
  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  examTitle: string;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty({ description: 'Score as percentage' })
  score: number;

  @ApiProperty({ type: () => [QuestionResponseDto] })
  questions: {
    questionId: string;
    text: string;
    options: string[];
    correctIndex: number;
    userSelectedIndex: number | null;
    isCorrect: boolean;
  }[];
}
