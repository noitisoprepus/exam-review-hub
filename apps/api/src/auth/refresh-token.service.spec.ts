import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let mockPrismaService: {
    refreshToken: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockPrismaService = {
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a refresh token with correct data', async () => {
    const userId = 'user-1';
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    mockPrismaService.refreshToken.create.mockResolvedValue({
      id: 'token-id-1',
      userId,
      tokenHash: 'hashed-token',
      expiresAt,
    });

    const result = await service.create(userId, token, expiresAt);

    expect(result).toMatchObject({
      userId,
      expiresAt,
    });
  });

  it('should return the refresh token if token is valid', async () => {
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    mockPrismaService.refreshToken.findMany.mockResolvedValue([
      {
        id: 'token-id-1',
        userId: 'user-1',
        tokenHash: '$argon2id$v=19$m=65536,t=3,p=4$' + token,
        expiresAt,
        revokedAt: null,
      },
    ]);

    const result = await service.findValid(token);

    expect(result).not.toBeNull();
  });

  it('should return null if token is expired', async () => {
    mockPrismaService.refreshToken.findMany.mockResolvedValue([]);

    const result = await service.findValid('token-123');

    expect(result).toBeNull();
  });

  it('should return null if token is invalid', async () => {
    mockPrismaService.refreshToken.findMany.mockResolvedValue([]);

    const result = await service.findValid('non-existent-token');

    expect(result).toBeNull();
  });

  it('should return null after revoking a token', async () => {
    const token = 'token-123';
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    mockPrismaService.refreshToken.findMany
      .mockResolvedValueOnce([
        {
          id: 'token-id-1',
          userId: 'user-1',
          tokenHash: '$argon2id$v=19$m=65536,t=3,p=4$' + token,
          expiresAt,
          revokedAt: null,
        },
      ])
      .mockResolvedValueOnce([]);

    await service.revoke(token);

    const result = await service.findValid(token);

    expect(result).toBeNull();
  });
});
