import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException("Don't find user");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Password don't right");

    const payload = { sub: user.id, email: user.email, role: user.role?.name };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
