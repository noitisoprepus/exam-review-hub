export interface JwtDto {
  /**
   * User ID
   */
  sub: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
