import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should produce a hash from a password', async () => {
    const password = 'supersecretpassword';

    const hash = await service.hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toEqual(password);
  });

  it('should produce different hashes for the same password', async () => {
    const password = 'supersecretpassword';

    const hash1 = await service.hashPassword(password);
    const hash2 = await service.hashPassword(password);

    expect(hash1).not.toEqual(hash2);
  });

  it('should validate correct password', async () => {
    const password = 'supersecretpassword';

    const hash = await service.hashPassword(password);

    const isValid = await service.validatePassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should invalidate icorrect password', async () => {
    const password = 'supersecretpassword';
    const wrongPassword = 'incorrectpassword';

    const hash = await service.hashPassword(password);

    const isValid = await service.validatePassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });
});
