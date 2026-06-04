import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../test/prisma-mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@gmail.com',
      name: 'Admin',
      password: 'hashed-password',
      role: { id: 'role-1', name: 'Admin' },
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtServiceMock.sign.mockReturnValue('access-token');

    const result = await service.login('admin@gmail.com', '123456');

    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-password');
    expect(jwtServiceMock.sign).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'access-token' });
  });

  it('should throw when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.login('wrong@gmail.com', '123456')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw when password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@gmail.com',
      name: 'Admin',
      password: 'hashed-password',
      role: { id: 'role-1', name: 'Admin' },
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login('admin@gmail.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
