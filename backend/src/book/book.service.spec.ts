import { BorrowStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { BookService } from './book.service';
import { prismaMock } from '../test/prisma-mock';
import { PrismaService } from './../../src/prisma/prisma.service';

describe('BookService', () => {
  let service: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    jest.clearAllMocks();
  });

  it('should create a book', async () => {
    prismaMock.book.create.mockResolvedValue({
      id: 'book-1',
      title: 'Clean Code',
    });

    const result = await service.create({
      title: 'Clean Code',
      description: 'A book about coding',
      quantity: 5,
      authorId: 'author-1',
      categoryId: 'category-1',
    });

    expect(prismaMock.book.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'book-1',
      title: 'Clean Code',
    });
  });

  it('should return paginated books', async () => {
    prismaMock.book.findMany.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Clean Code',
        description: null,
        createdAt: new Date(),
        quantity: 3,
        authorId: 'author-1',
        categoryId: 'cat-1',
        author: { id: 'author-1', name: 'Robert C. Martin' },
        category: { id: 'cat-1', name: 'Programming' },
        _count: { borrowRecords: 4 },
      },
    ]);

    prismaMock.book.count.mockResolvedValue(1);

    const result = await service.findAll({
      page: 1,
      pageSize: 10,
      search: 'clean',
    });

    expect(result.meta.total).toBe(1);
    expect(result.data[0].title).toBe('Clean Code');
    expect(result.data[0].borrowRecordCount).toBe(4);
  });

  it('should throw NotFoundException when book not found in remove', async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);

    await expect(service.remove('book-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when deleting borrowed book', async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      id: 'book-1',
    });

    prismaMock.borrowRecord.findFirst.mockResolvedValue({
      id: 'borrow-1',
      bookId: 'book-1',
      status: BorrowStatus.BORROWED,
    });

    await expect(service.remove('book-1')).rejects.toThrow(BadRequestException);
  });
});
