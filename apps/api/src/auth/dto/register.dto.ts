export class RegisterDto {
  email: string;
  password: string;

  role: 'LEARNER' | 'CREATOR';
}
