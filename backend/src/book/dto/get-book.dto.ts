import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

export class GetBooksDto {
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
}