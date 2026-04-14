import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateExamDto {
  @ApiProperty({ example: 'Updated Exam Title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-of-target-exam', required: false })
  @IsString()
  @IsOptional()
  targetExamId?: string;
}
