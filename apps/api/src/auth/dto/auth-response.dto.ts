import { UserStatus } from 'prisma/generated/prisma/enums';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;

  user: {
    id: string;
    email: string;

    role: 'LEARNER' | 'CREATOR';

    isAdmin: boolean;
    status: UserStatus;
  };
}
