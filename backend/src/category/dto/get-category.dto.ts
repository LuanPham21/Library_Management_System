import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

export class GetCategoriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize = 10;
}
