import { BorrowStatus } from '@prisma/client';

export function getBorrowStatus(
  status: BorrowStatus,
  dueDate: Date,
): BorrowStatus | 'OVERDUE' {
  if (status === BorrowStatus.Returned) {
    return BorrowStatus.Returned;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today ? BorrowStatus.Overdue : BorrowStatus.BORROWED;
}
