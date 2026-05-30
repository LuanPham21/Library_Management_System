import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) { }

  create(createRoleDto: CreateRoleDto) {
    return this.prismaService.role.create({
      data: createRoleDto,
      select: {
        id: true,
        name: true,
      }
    });
  }

  findAll() {
    return this.prismaService.role.findMany({
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
      return this.prismaService.role.findUniqueOrThrow({
        where: { id },
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException('Role not found');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  async remove(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
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
        deletedAt: new Date()
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
            }
          },
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }
}
