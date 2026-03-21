import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenService],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a refresh token with correct data', async () => {
    const userId = 'user-1';
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const result = await service.create(userId, token, expiresAt);

    expect(result).toMatchObject({
      userId,
      expiresAt,
    });
  });

  it('should return the refresh token if token is valid', async () => {
    const userId = 'user-1';
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await service.create(userId, token, expiresAt);

    const result = await service.findValid(token);

    expect(result).not.toBeNull();
  });

  it('should return null if token is expired', async () => {
    const userId = 'user-1';
    const token = 'token-123';
    const expiresAt = new Date(Date.now() - 1000 * 60 * 60); // already expired

    await service.create(userId, token, expiresAt);

    const result = await service.findValid(token);

    expect(result).toBeNull();
  });

  it('should return null if token is invalid', async () => {
    const result = await service.findValid('non-existent-token');

    expect(result).toBeNull();
  });

  it('should return null after revoking a token', async () => {
    const userId = 'user-1';
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await service.create(userId, token, expiresAt);

    await service.revoke(token);

    const result = await service.findValid(token);

    expect(result).toBeNull();
  });
});
