import { Injectable } from '@nestjs/common';
import { BorrowStatus } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalBooks,
      totalUsers,
      totalAuthors,
      totalCategories,
      totalBorrowed,
      returnedThisMonth,
      totalOverdue,
    ] = await Promise.all([
      this.prismaService.book.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prismaService.author.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prismaService.category.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prismaService.borrowRecord.count({
        where: {
          status: BorrowStatus.BORROWED,
        },
      }),

      this.prismaService.borrowRecord.count({
        where: {
          status: BorrowStatus.Returned,
          returnDate: {
            gte: startOfMonth,
          },
        },
      }),
      this.prismaService.borrowRecord.count({
        where: {
          status: BorrowStatus.BORROWED,
          dueDate: {
            lt: today,
          },
        },
      }),
    ]);

    return {
      totalBooks,
      totalUsers,
      totalAuthors,
      totalCategories,
      totalBorrowed,
      returnedThisMonth,
      totalOverdue,
    };
  }

  async getTopBooks() {
    const books = await this.prismaService.book.findMany({
      where: {
        deletedAt: null,
      },

      select: {
        id: true,
        title: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            borrowRecords: true,
          },
        },
      },

      orderBy: {
        borrowRecords: {
          _count: 'desc',
        },
      },

      take: 5,
    });

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      borrowRecordCount: book._count.borrowRecords,
      author: book.author,
    }));
  }

  async getTopCategories() {
    const result = await this.prismaService.$queryRaw<
      {
        id: string;
        name: string;
        borrowRecordCount: bigint;
      }[]
    >`
        SELECT
            c.id,
            c.name,
            COUNT(br.id) AS "borrowRecordCount"
        FROM "Category" c
        INNER JOIN "Book" b
            ON b."categoryId" = c.id AND b."deletedAt" IS NULL
        INNER JOIN "BorrowRecord" br
            ON br."bookId" = b.id
        WHERE c."deletedAt" IS NULL
        GROUP BY c.id, c.name
        ORDER BY COUNT(br.id) DESC
        LIMIT 5
    `;

    const total = result.reduce(
      (sum, item) => sum + Number(item.borrowRecordCount),
      0,
    );

    return result.map((item) => ({
      id: item.id,
      name: item.name,
      borrowRecordCount: Number(item.borrowRecordCount),
      pct:
        total > 0
          ? Math.round((Number(item.borrowRecordCount) / total) * 100)
          : 0,
    }));
  }

  async getRecentBorrows() {
    return this.prismaService.borrowRecord.findMany({
      take: 10,

      select: {
        id: true,
        borrowDate: true,
        dueDate: true,
        returnDate: true,
        status: true,
        user: {
          select: { name: true },
        },
        book: {
          select: {
            title: true,
            author: { select: { name: true } },
          },
        },
      },

      orderBy: {
        borrowDate: 'desc',
      },
    });
  }
}
