import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'UserPassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'LEARNER', enum: ['LEARNER', 'CREATOR'] })
  @IsIn(['LEARNER', 'CREATOR'])
  role: 'LEARNER' | 'CREATOR';
}
