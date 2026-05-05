import { UserStatus } from '../../../prisma/generated/prisma/enums';

export interface JwtDto {
  /**
   * User ID
   */
  sub: string;
  isAdmin: boolean;
  status: UserStatus;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
