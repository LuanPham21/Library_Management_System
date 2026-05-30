import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { GetBorrowRecordDto } from './dto/get-borrow-record.dto';
import { BorrowStatus, Prisma } from '@prisma/client';

@Injectable()
export class BorrowRecordService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(createBorrowRecordDto: CreateBorrowRecordDto) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id: createBorrowRecordDto.bookId,
        deletedAt: null,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.quantity <= 0) {
      throw new BadRequestException(
        'Book is out of stock',
      );
    }

    return this.prismaService.$transaction(async (tx) => {

      const borrowRecord =
        await tx.borrowRecord.create({
          data: {
            ...createBorrowRecordDto,
            status: BorrowStatus.BORROWED,
          },
        });

      await tx.book.update({
        where: {
          id: createBorrowRecordDto.bookId,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      return borrowRecord;
    });
  }

  async findAll(query: GetBorrowRecordDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.BorrowRecordWhereInput = {};

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            is: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          user: {
            is: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          book: {
            is: {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const [borrowRecord, total] = await Promise.all([
      this.prismaService.borrowRecord.findMany({
        where: where,
        skip,
        take: pageSize,

        orderBy: {
          borrowDate: 'asc',
        },
      }),

      this.prismaService.borrowRecord.count({
        where,
      }),
    ]);

    return {
      data: borrowRecord,

      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  findOne(id: string) {
    try {
      return this.prismaService.borrowRecord.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          user: {
            select: {
              name: true
            }
          },
          book: {
            select: {
              title: true
            }
          },
          borrowDate: true,
          dueDate: true,
          updatedAt: true,
          returnDate: true,
          status: true
        }
      });
    } catch (error) {
      throw new NotFoundException('Borrow record not found');
    }
  }

  async update(id: string, updateBorrowRecordDto: UpdateBorrowRecordDto) {
    const item = await this.prismaService.borrowRecord.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException();
    }

    if (item.status !== BorrowStatus.BORROWED) {
      throw new BadRequestException(
        'Book already returned',
      );
    }

    try {
      return this.prismaService.$transaction(async (tx) => {
        if (updateBorrowRecordDto.status === BorrowStatus.Returned) {
          await tx.book.update({
            where: {
              id: item.bookId,
            },
            data: {
              quantity: {
                increment: 1,
              },
            },
          });
        }

        return this.prismaService.borrowRecord.update({
          where: { id },
          data: {
            ...updateBorrowRecordDto,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            },
            book: {
              select: {
                title: true
              }
            },
            borrowDate: true,
            dueDate: true,
            updatedAt: true,
            returnDate: true,
            status: true
          }
        });
      })
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  remove(id: string) {
    return `This action removes a #${id} borrowRecord`;
  }
}
