import { Test, TestingModule } from '@nestjs/testing';

import { BookService } from './book.service';
import { BookController } from './book.controller';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('BookController', () => {
  let controller: BookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [BookService, PrismaService],
    }).compile();

    controller = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
