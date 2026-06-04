import type { BookBase } from "./book.type";
import type { Timestamps } from "./common.type";

export interface CategoryBase extends Timestamps {
  id: string;
  name: string;
}

export interface CategoryListItem extends CategoryBase {
  bookCount: number;
}

export interface CategoryDetail extends CategoryBase {
  book: BookBase[];
  bookCount: number;
}
