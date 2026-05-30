import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateBorrowRecordDto {
    @ApiPropertyOptional()
    @IsString()
    userId: string;

    @ApiPropertyOptional()
    @IsString()
    bookId: string;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    dueDate: string;
}
