import { ListQueryDto } from "./common.dto";

export class UserQueryDto extends ListQueryDto { }

export type UserPayload = {
    name: string;
    email: string;
    password: string;
};