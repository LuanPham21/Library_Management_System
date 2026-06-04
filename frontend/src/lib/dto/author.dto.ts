import { ListQueryDto } from "./common.dto";

export class AuthorQueryDto extends ListQueryDto { }

export type AuthorPayload = {
    name: string;
};