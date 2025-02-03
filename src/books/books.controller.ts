import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,   
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/createBook.dto';
import { UpdateBookDto } from './dtos/updateBook.dto';
import { UpdateBookStatusDto } from './dtos/updateBookStatus.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';


@UseGuards(JwtAuthGuard)
@Controller({ path:'books', version: '1' })
export class BooksController {
    constructor(private readonly booksService: BooksService) {}
    
    // super admin stuff
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async deleteBook(@Param('id') id: number) {
      return this.booksService.delete(id);
    }

    // --- Author Endpoints ---
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.AUTHOR)
    async createBook(@Body() createBookDto: CreateBookDto, @Req() req) {
      return this.booksService.create(createBookDto, req.user);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async updateBook(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto, @Req() req) {
      return this.booksService.update(id, updateBookDto, req.user);
    }
  
    // --- Publisher Endpoints ---
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.PUBLISHER, UserRole.ADMIN)
    async updateBookStatus(@Param('id') id: number, @Body() updateBookStatusDto: UpdateBookStatusDto, @Req() req) {
      return this.booksService.updateStatus(id, updateBookStatusDto.status, req.user);
    }

    @Get('/binding')
    @UseGuards(RolesGuard)
    @Roles(UserRole.PUBLISHER, UserRole.ADMIN)
    async getAllBindingBooks() {
      return this.booksService.findAllBinding();
    }
  
    // --- Public/Shared Endpoints ---
    @Get()
    async getAllPublishedBooks() {
      return this.booksService.findAllPublished();
    }
  
    @Get(':id')
    async getBookById(@Param('id') id: number) {
      return this.booksService.findOne(id);
    }
  }