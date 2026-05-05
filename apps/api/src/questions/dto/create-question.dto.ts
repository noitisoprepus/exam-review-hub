import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty } from '../../../prisma/generated/prisma/enums';

export class QuestionOptionDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  optionIndex: number;

  @ApiProperty({ example: 'The correct answer' })
  @IsString()
  text: string;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is the capital of France?' })
  @IsString()
  text: string;

  @ApiProperty({
    example: 1,
    description: 'Index of the correct option (0-based)',
  })
  @IsInt()
  @Min(0)
  @Max(3)
  correctOptionIndex: number;

  @ApiProperty({ example: 'Paris is the capital of France.' })
  @IsString()
  explanation: string;

  @ApiProperty({ enum: QuestionDifficulty, example: 'MEDIUM' })
  @IsEnum(QuestionDifficulty)
  difficulty: QuestionDifficulty;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      { optionIndex: 0, text: 'Paris' },
      { optionIndex: 1, text: 'London' },
      { optionIndex: 2, text: 'Berlin' },
      { optionIndex: 3, text: 'Madrid' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}
