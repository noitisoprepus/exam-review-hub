import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartAttemptDto {
  @ApiProperty({ example: 'uuid-of-exam' })
  @IsString()
  examId: string;
}
