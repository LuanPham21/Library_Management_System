import { Test, TestingModule } from '@nestjs/testing';

import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthorController', () => {
  let controller: AuthorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [AuthorService, PrismaService],
    }).compile();

    controller = module.get<AuthorController>(AuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
