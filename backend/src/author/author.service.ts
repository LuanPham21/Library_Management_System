import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) { }

  create(createAuthorDto: CreateAuthorDto) {
    return this.prismaService.author.create({
      data: createAuthorDto,
      select: {
        id: true,
        name: true,
      }
    });
  }

  findAll() {
    return this.prismaService.author.findMany({
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
      return this.prismaService.author.findUniqueOrThrow({
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

  async update(id: string, updateAuthorDto: UpdateAuthorDto) {
    const role = await this.prismaService.author.findUnique({
      where: { id },
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.author.findUnique({
      where: { id },
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
        deletedAt: new Date()
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }
}
