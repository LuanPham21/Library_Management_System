import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { BookService } from './book.service';
import { GetBooksDto } from './dto/get-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(@Query() query: GetBooksDto) {
    return this.bookService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Get('findbookbyauthorid/:id')
  findBookByAuthorId(@Param('id') id: string, @Query() query: GetBooksDto) {
    return this.bookService.findBookByAuthorId(id, query);
  }

  @Get('findbookbycategoryid/:id')
  findBookByCategoryId(@Param('id') id: string, @Query() query: GetBooksDto) {
    return this.bookService.findBookByCategoryId(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
