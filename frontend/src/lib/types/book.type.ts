import type { UserBase } from "./user.type";
import type { AuthorBase } from "./author.type";
import type { Timestamps } from "./common.type";
import type { CategoryBase } from "./category.type";
import type { BorrowStatus } from "../enum/library";

export interface BookBase extends Timestamps {
  id: string;
  title: string;
  description: string;
  quantity: number;

  category: CategoryBase;
  author: AuthorBase;
}

export interface BookListItem extends BookBase {
  borrowRecordCount: number;
}

export interface BookDetail extends BookBase {
  borrowRecords: BorrowRecord[];
  borrowRecordCount: number;
}

export interface BorrowRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  updatedAt: string;
  returnDate?: string | null;
  status: BorrowStatus;

  userId: string;
  bookId: string;

  user: UserBase;
  book: BookBase;
}
