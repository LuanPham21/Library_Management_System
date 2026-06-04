import type { BookBase } from "./book.type";
import type { Timestamps } from "./common.type";

export interface AuthorBase extends Timestamps {
  id: string;
  name: string;
}

export interface AuthorListItem extends AuthorBase {
  bookCount: number;
}

export interface AuthorDetail extends AuthorBase {
  book: BookBase[];
  bookCount: number;
}
