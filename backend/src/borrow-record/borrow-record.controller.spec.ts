import { Test, TestingModule } from '@nestjs/testing';

import { BorrowRecordService } from './borrow-record.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BorrowRecordController } from './borrow-record.controller';

describe('BorrowRecordController', () => {
  let controller: BorrowRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowRecordController],
      providers: [BorrowRecordService, PrismaService],
    }).compile();

    controller = module.get<BorrowRecordController>(BorrowRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
