import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BorrowStatus } from '@prisma/client';

import { prismaMock } from '../test/prisma-mock';
import { BorrowRecordService } from './borrow-record.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('BorrowRecordService', () => {
  let service: BorrowRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowRecordService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BorrowRecordService>(BorrowRecordService);
    jest.clearAllMocks();
  });

  it('should create borrow record and decrement book quantity', async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      id: 'book-1',
      quantity: 2,
    });

    prismaMock.$transaction.mockImplementation((cb: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      cb({
        borrowRecord: {
          create: jest.fn().mockResolvedValue({
            id: 'borrow-1',
            status: BorrowStatus.BORROWED,
          }),
        },
        book: {
          update: jest.fn().mockResolvedValue({
            id: 'book-1',
          }),
        },
      }),
    );

    const result = await service.create({
      userId: 'user-1',
      bookId: 'book-1',
      dueDate: new Date('2026-06-10').toDateString(),
    });

    expect(prismaMock.book.findUnique).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result.status).toBe(BorrowStatus.BORROWED);
  });

  it('should throw if book not found', async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        userId: 'user-1',
        bookId: 'book-1',
        dueDate: new Date().toDateString(),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if book out of stock', async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      id: 'book-1',
      quantity: 0,
    });

    await expect(
      service.create({
        userId: 'user-1',
        bookId: 'book-1',
        dueDate: new Date().toDateString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should find one borrow record', async () => {
    prismaMock.borrowRecord.findUniqueOrThrow.mockResolvedValue({
      id: 'borrow-1',
      user: { id: 'user-1', name: 'User A' },
      book: { id: 'book-1', title: 'Clean Code' },
      borrowDate: new Date(),
      dueDate: new Date(),
      updatedAt: new Date(),
      returnDate: null,
      status: BorrowStatus.BORROWED,
    });

    const result = await service.findOne('borrow-1');

    expect(result.id).toBe('borrow-1');
    expect(result.book.title).toBe('Clean Code');
  });
});
