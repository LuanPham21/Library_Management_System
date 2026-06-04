import { BorrowStatus, Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GetUsersDto } from './dto/get-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from 'src/common/utils/hashing';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashPassword(createUserDto.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
      },
    });
  }

  async findAll(query: GetUsersDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
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

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roleId: true,

          role: {
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

      this.prismaService.user.count({
        where,
      }),
    ]);

    return {
      data: users.map((_item) => ({
        id: _item.id,
        name: _item.name,
        email: _item.email,
        createdAt: _item.createdAt,
        roleId: _item.roleId,
        role: _item.role,
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

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { id, deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,

          roleId: true,

          role: {
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
      });

      return {
        ...user,
        borrowRecordCount: user._count.borrowRecords,
      };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findUserByRoleId(id: string, query: GetUsersDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      roleId: id,
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

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },

        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prismaService.user.count({
        where,
      }),
    ]);

    return {
      data: users,

      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const role = await this.prismaService.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('User not found');
    }

    try {
      const dataUpdate = {
        ...updateUserDto,
        updatedAt: new Date(),
      };

      if (updateUserDto.password) {
        dataUpdate.password = hashPassword(updateUserDto.password);
      }

      return this.prismaService.user.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          name: true,
          email: true,
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
    const role = await this.prismaService.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('User not found');
    }

    const activeBorrow = await this.prismaService.borrowRecord.findFirst({
      where: {
        userId: id,
        status: BorrowStatus.BORROWED,
      },
    });

    if (activeBorrow) {
      throw new BadRequestException('Không thể xoá người dùng đang được sách');
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      return this.prismaService.user.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          name: true,
          email: true,
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
