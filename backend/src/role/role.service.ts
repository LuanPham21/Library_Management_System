import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GetRolesDto } from './dto/get-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createRoleDto: CreateRoleDto) {
    return this.prismaService.role.create({
      data: createRoleDto,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findAll(query: GetRolesDto) {
    const { page, pageSize, search } = query;

    const skip = (page - 1) * pageSize;
    const where: Prisma.RoleWhereInput = {
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

    const [roles, total] = await Promise.all([
      this.prismaService.role.findMany({
        where,
        skip,
        take: pageSize,

        select: {
          id: true,
          name: true,
          createdAt: true,

          _count: {
            select: {
              user: {
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

      this.prismaService.role.count({
        where,
      }),
    ]);

    return {
      data: roles.map((_item) => ({
        id: _item.id,
        name: _item.name,
        createdAt: _item.createdAt,
        userCount: _item._count.user,
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
      const role = await this.prismaService.role.findUniqueOrThrow({
        where: { id, deletedAt: null },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          _count: {
            select: {
              user: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        ...role,
        userCount: role._count.user,
      };
    } catch (error) {
      throw new NotFoundException('Role not found');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    try {
      return this.prismaService.role.update({
        where: { id },
        data: {
          ...updateRoleDto,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
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
    const role = await this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const totalUsers = await this.prismaService.user.count({
      where: {
        roleId: id,
        deletedAt: null,
      },
    });

    if (totalUsers > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${totalUsers} users are using this role.`,
      );
    }

    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      return this.prismaService.role.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Something went wrong');
    }
  }
}
