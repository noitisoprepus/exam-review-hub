import { ApiProperty } from '@nestjs/swagger';
import {
  CreatorType,
  VerificationStatus,
} from '../../../prisma/generated/prisma/enums';

export class CreatorProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: CreatorType })
  creatorType: CreatorType;

  @ApiProperty({ enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @ApiProperty({ nullable: true })
  verifiedAt: Date | null;

  @ApiProperty({ nullable: true })
  rejectedReason: string | null;

  @ApiProperty()
  reputationScore: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
