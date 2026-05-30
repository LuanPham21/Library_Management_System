import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { BorrowRecordService } from './borrow-record.service';
import { GetBorrowRecordDto } from './dto/get-borrow-record.dto';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';

@Controller('borrow')
export class BorrowRecordController {
  constructor(private readonly borrowRecordService: BorrowRecordService) { }

  @Post()
  create(@Body() createBorrowRecordDto: CreateBorrowRecordDto) {
    return this.borrowRecordService.create(createBorrowRecordDto);
  }

  @Get()
  findAll(@Query() query: GetBorrowRecordDto) {
    return this.borrowRecordService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowRecordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBorrowRecordDto: UpdateBorrowRecordDto) {
    return this.borrowRecordService.update(id, updateBorrowRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowRecordService.remove(id);
  }
}
