import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetBooksDto } from './dto/get-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) { }

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
      }
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
        where: where,
        skip,
        take: pageSize,

        include: {
          author: true,
          category: true,
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
      data: books,

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
        }
      });
    } catch (error) {
      throw new NotFoundException('Book not found');
    }
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
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Book not found');
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date()
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
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }
}
