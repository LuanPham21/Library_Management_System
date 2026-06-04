import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { prismaMock } from '../test/prisma-mock';
import { CategoryService } from './category.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  it('should create category', async () => {
    prismaMock.category.create.mockResolvedValue({
      id: 'cat-1',
      name: 'Programming',
    });

    const result = await service.create({
      name: 'Programming',
    });

    expect(prismaMock.category.create).toHaveBeenCalled();
    expect(result.name).toBe('Programming');
  });

  it('should return paginated categories', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        id: 'cat-1',
        name: 'Programming',
        createdAt: new Date(),
        _count: { book: 7 },
      },
    ]);

    prismaMock.category.count.mockResolvedValue(1);

    const result = await service.findAll({
      page: 1,
      pageSize: 10,
      search: 'prog',
    });

    expect(result.meta.total).toBe(1);
    expect(result.data[0].bookCount).toBe(7);
  });

  it('should throw NotFoundException if category not found', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(
      service.update('cat-1', { name: 'New' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should not delete category if books exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Programming',
    });
    prismaMock.book.count.mockResolvedValue(2);

    await expect(service.remove('cat-1')).rejects.toThrow(BadRequestException);
  });
});
