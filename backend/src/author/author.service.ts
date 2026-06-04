import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { GetAuthorsDto } from './dto/get-author.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createAuthorDto: CreateAuthorDto) {
    return this.prismaService.author.create({
      data: createAuthorDto,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findAll(query: GetAuthorsDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.AuthorWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [authors, total] = await Promise.all([
      this.prismaService.author.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          name: true,
          createdAt: true,

          _count: {
            select: {
              book: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prismaService.author.count({
        where,
      }),
    ]);

    return {
      data: authors.map((author) => ({
        id: author.id,
        name: author.name,
        createdAt: author.createdAt,
        bookCount: author._count.book,
      })),

      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    try {
      const author = await this.prismaService.author.findUniqueOrThrow({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          _count: {
            select: {
              book: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        ...author,
        bookCount: author._count.book,
      };
    } catch (error) {
      throw new NotFoundException('Author not found');
    }
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto) {
    const role = await this.prismaService.author.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!role) {
      throw new NotFoundException('Author not found');
    }

    try {
      return this.prismaService.author.update({
        where: { id },
        data: {
          ...updateAuthorDto,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          book: {
            select: {
              id: true,
              title: true,
              description: true,
              quantity: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Something went wrong');
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.author.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!role) {
      throw new NotFoundException('Author not found');
    }

    const totalBooks = await this.prismaService.book.count({
      where: {
        authorId: id,
        deletedAt: null,
      },
    });

    if (totalBooks > 0) {
      throw new BadRequestException(
        `Cannot delete author. ${totalBooks} books are using this author.`,
      );
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      return this.prismaService.author.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          book: {
            select: {
              id: true,
              title: true,
              description: true,
              quantity: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Something went wrong');
    }
  }
}
