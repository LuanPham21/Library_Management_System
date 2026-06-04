import { Test, TestingModule } from '@nestjs/testing';

import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('RoleController', () => {
  let controller: RoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [RoleService, PrismaService],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
