import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ example: 'uuid-of-question' })
  @IsString()
  questionId: string;

  @ApiProperty({
    example: 1,
    description: 'Index of the selected option (0-based)',
  })
  @IsInt()
  @Min(0)
  @Max(3)
  selectedIndex: number;
}
