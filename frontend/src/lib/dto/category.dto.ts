import { ListQueryDto } from "./common.dto";

export class CategoryQueryDto extends ListQueryDto { }

export type CategoryPayload = {
    name: string;
};