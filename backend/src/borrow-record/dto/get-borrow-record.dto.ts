import { BorrowStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';

export class GetBorrowRecordDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    pageSize: number = 10;

    @IsOptional()
    @IsEnum(BorrowStatus)
    status?: BorrowStatus;
}