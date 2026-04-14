import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty } from 'prisma/generated/prisma/enums';

export class QuestionOptionDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  optionIndex: number;

  @ApiProperty({ example: 'The correct answer' })
  @IsString()
  text: string;
}

export class UpdateQuestionDto {
  @ApiProperty({ example: 'What is the capital of France?', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    example: 1,
    description: 'Index of the correct option (0-based)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  correctOptionIndex?: number;

  @ApiProperty({ example: 'Paris is the capital of France.', required: false })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ enum: QuestionDifficulty, example: 'MEDIUM', required: false })
  @IsEnum(QuestionDifficulty)
  @IsOptional()
  difficulty?: QuestionDifficulty;

  @ApiProperty({ type: [QuestionOptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];
}
