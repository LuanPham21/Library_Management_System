import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BorrowStatus, Prisma } from '@prisma/client';

import { GetBooksDto } from './dto/get-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createBookDto: CreateBookDto) {
    return this.prismaService.book.create({
      data: createBookDto,
      select: {
        id: true,
        title: true,
        description: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async findAll(query: GetBooksDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.BookWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          author: {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ];
    }

    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          quantity: true,
          authorId: true,
          categoryId: true,

          author: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              borrowRecords: {
                where: {
                  status: {
                    not: BorrowStatus.Overdue,
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prismaService.book.count({
        where,
      }),
    ]);

    return {
      data: books.map((_item) => ({
        id: _item.id,
        title: _item.title,
        description: _item.description,
        createdAt: _item.createdAt,
        quantity: _item.quantity,
        author: _item.author,
        authorId: _item.authorId,
        category: _item.category,
        categoryId: _item.categoryId,
        borrowRecordCount: _item._count.borrowRecords,
      })),

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
      return this.prismaService.book.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          authorId: true,
          categoryId: true,

          author: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Book not found');
    }
  }

  async findBookByAuthorId(id: string, query: GetBooksDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.BookWhereInput = {
      deletedAt: null,
      authorId: id,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          title: true,
          createdAt: true,
          quantity: true,

          _count: {
            select: {
              borrowRecords: {
                where: {
                  status: {
                    not: BorrowStatus.Overdue,
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prismaService.book.count({
        where,
      }),
    ]);

    return {
      data: books.map((_item) => ({
        id: _item.id,
        title: _item.title,
        createdAt: _item.createdAt,
        quantity: _item.quantity,
        borrowRecordCount: _item._count.borrowRecords,
      })),

      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findBookByCategoryId(id: string, query: GetBooksDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.BookWhereInput = {
      deletedAt: null,
      categoryId: id,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          title: true,
          createdAt: true,
          quantity: true,

          _count: {
            select: {
              borrowRecords: {
                where: {
                  status: {
                    not: BorrowStatus.Overdue,
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prismaService.book.count({
        where,
      }),
    ]);

    return {
      data: books.map((_item) => ({
        id: _item.id,
        title: _item.title,
        createdAt: _item.createdAt,
        quantity: _item.quantity,
        borrowRecordCount: _item._count.borrowRecords,
      })),

      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const item = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Book not found');
    }

    try {
      return this.prismaService.book.update({
        where: { id },
        data: {
          ...updateBookDto,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          description: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Something went wrong');
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Book not found');
    }

    const activeBorrow = await this.prismaService.borrowRecord.findFirst({
      where: {
        bookId: id,
        status: BorrowStatus.BORROWED,
      },
    });

    if (activeBorrow) {
      throw new BadRequestException('Không thể xoá sách đang được mượn');
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      return this.prismaService.book.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          title: true,
          description: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Something went wrong');
    }
  }
}
