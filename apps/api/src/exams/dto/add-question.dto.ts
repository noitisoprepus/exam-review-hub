import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class AddQuestionToExamDto {
  @ApiProperty({ example: 'uuid-of-question' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  orderIndex: number;
}
