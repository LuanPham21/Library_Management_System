import type { RoleBase } from "./role.type";
import type { Timestamps } from "./common.type";
import type { BorrowRecord } from "./book.type";

export interface UserBase extends Timestamps {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleBase;
}

export interface UserListItem extends UserBase {
  borrowRecordCount: number;
}

export interface UserDetail extends UserBase {
  borrowRecords: BorrowRecord[];
  borrowRecordCount: number;
}
