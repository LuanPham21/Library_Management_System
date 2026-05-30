import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) { }

  create(createCategoryDto: CreateCategoryDto) {
    return this.prismaService.category.create({
      data: createCategoryDto,
      select: {
        id: true,
        name: true,
      }
    });
  }

  findAll() {
    return this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      }
    });
  }

  findOne(id: string) {
    try {
      return this.prismaService.category.findUniqueOrThrow({
        where: { id },
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException('Author not found');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const role = await this.prismaService.category.findUnique({
      where: { id },
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.category.findUnique({
      where: { id },
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
        deletedAt: new Date()
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }
}
