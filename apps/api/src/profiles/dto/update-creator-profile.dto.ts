import { ApiProperty } from '@nestjs/swagger';

export class UpdateCreatorProfileDto {
  @ApiProperty({ description: 'No user-editable fields. System-managed only.' })
  _empty?: never;
}
