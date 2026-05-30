import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBorrowRecordDto } from './create-borrow-record.dto';
import { BorrowStatus } from '@prisma/client';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBorrowRecordDto extends PartialType(CreateBorrowRecordDto) {
    @ApiPropertyOptional({
        enum: BorrowStatus,
    })
    @IsOptional()
    @IsEnum(BorrowStatus)
    status?: BorrowStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    returnDate?: Date;
}
