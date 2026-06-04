import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { RoleModule } from './role/role.module';
import { AppController } from './app.controller';
import { JwtGuard } from './auth/guards/jwt.guard';
import { AuthorModule } from './author/author.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { BorrowRecordModule } from './borrow-record/borrow-record.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    BookModule,
    CategoryModule,
    AuthorModule,
    RoleModule,
    PrismaModule,
    BorrowRecordModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
