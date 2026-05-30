import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { BorrowRecordService } from './borrow-record.service';
import { BorrowRecordController } from './borrow-record.controller';

@Module({
  controllers: [BorrowRecordController],
  providers: [BorrowRecordService, PrismaService],
})
export class BorrowRecordModule { }
