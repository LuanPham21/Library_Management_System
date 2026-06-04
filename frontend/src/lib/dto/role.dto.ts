import { ListQueryDto } from "./common.dto";

export class RoleQueryDto extends ListQueryDto { }

export type RolePayload = {
    name: string;
};