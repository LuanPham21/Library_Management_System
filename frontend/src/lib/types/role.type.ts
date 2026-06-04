import type { UserBase } from "./user.type";
import type { Timestamps } from "./common.type";

export interface RoleBase extends Timestamps {
  id: string;
  name: string;
}

export interface RoleListItem extends RoleBase {
  userCount: number;
}

export interface RoleDetail extends RoleBase {
  user: UserBase[];
  userCount: number;
}
