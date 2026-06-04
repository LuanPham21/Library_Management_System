import type { BorrowStatus } from "../enum/library";
import { ListQueryDto } from "./common.dto";

export class BookQueryDto extends ListQueryDto { }

export type BookPayload = {
    title: string;
    description: string;
    quantity: number;
    categoryId: string;
    authorId: string;
};

export class BorrowRecordQueryDto extends ListQueryDto { }

export type BorrowRecordPayload = {
    userId: string;
    bookId: string;
    dueDate: string;
    returnDate?: string;
    status: BorrowStatus;
};

export type CreateBorrowRecordPayload = {
    userId: string;
    bookId: string;
    dueDate: string;
};

export type UpdateBorrowRecordPayload = CreateBorrowRecordPayload & {
    returnDate?: string;
    status: BorrowStatus;
};