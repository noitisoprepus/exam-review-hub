import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  constructor() {}

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }
}
