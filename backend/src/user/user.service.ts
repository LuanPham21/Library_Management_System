import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/common/utils/hashing';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }

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
        roleId: true
      }
    });
  }

  findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      }
    });
  }

  findOne(id: string) {
    try {
      return this.prismaService.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        }
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
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
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }

  remove(id: string) {
    try {
      const dataUpdate = {
        updatedAt: new Date(),
        deletedAt: new Date()
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
        }
      });
    } catch (error) {
      throw new NotFoundException("Something went wrong");
    }
  }
}
