import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CreatorType } from 'prisma/generated/prisma/client';

export class CreateCreatorProfileDto {
  @ApiProperty({ enum: CreatorType, example: 'INDIVIDUAL' })
  @IsEnum(CreatorType)
  creatorType: CreatorType;
}
