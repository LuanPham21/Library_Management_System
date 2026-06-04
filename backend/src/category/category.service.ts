import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesDto } from './dto/get-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prismaService.category.create({
      data: createCategoryDto,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findAll(query: GetCategoriesDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.CategoryWhereInput = {
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

    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
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

      this.prismaService.category.count({
        where,
      }),
    ]);

    return {
      data: categories.map((_item) => ({
        id: _item.id,
        name: _item.name,
        createdAt: _item.createdAt,
        bookCount: _item._count.book,
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
      const category = await this.prismaService.category.findUniqueOrThrow({
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
        ...category,
        bookCount: category._count.book,
      };
    } catch (error) {
      throw new NotFoundException('Author not found');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const role = await this.prismaService.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!role) {
      throw new NotFoundException('Category not found');
    }

    try {
      return this.prismaService.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
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
    const role = await this.prismaService.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('Category not found');
    }

    const totalBooks = await this.prismaService.book.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (totalBooks > 0) {
      throw new BadRequestException(
        `Cannot delete category. ${totalBooks} books are using this category.`,
      );
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      return this.prismaService.category.update({
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
