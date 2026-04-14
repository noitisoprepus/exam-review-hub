import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: 'Sample Exam' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is a sample exam description.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-of-target-exam' })
  @IsString()
  targetExamId: string;
}
