import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStatus } from './entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateBookDto } from './dtos/createBook.dto';
import { UpdateBookDto } from './dtos/updateBook.dto';


@Injectable()
export class BooksService {
    constructor(
      @InjectRepository(Book)
      private booksRepository: Repository<Book>,
    ) {}
  
    
    async create(createBookDto: CreateBookDto, author: User): Promise<Book> {
      const book = this.booksRepository.create({
        ...createBookDto,
        status: BookStatus.BINDING,
        author,
      });
      return this.booksRepository.save(book);
    }
  

    async update(id: number, updateBookDto: UpdateBookDto, author: User): Promise<Book> {
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: ['author'],
      });
  
      if (!book) throw new NotFoundException('Book not found');

      if (book.author.id !== author.id)
        throw new ForbiddenException('You are not the author');

      if (book.status !== BookStatus.BINDING)
        throw new ForbiddenException('Cannot edit a published/rejected book');
  
      Object.assign(book, updateBookDto);
      return this.booksRepository.save(book);
    }
  

    async updateStatus( id: number, status: BookStatus.PUBLISHED | BookStatus.REJECTED, publisher: User): Promise<Book> {
      const book = await this.booksRepository.findOneBy({ id });
      if (!book) throw new NotFoundException('Book not found');
  
      book.status = status;
      book.publishedBy = publisher;
      return this.booksRepository.save(book);
    }
  
    // Get all published books
    async findAllPublished(): Promise<Book[]> {
      return this.booksRepository.find({ where: { status: BookStatus.PUBLISHED } });
    }

    // get all binding
    async findAllBinding(): Promise<Book[] | { message: string }> {
      const books = await this.booksRepository.find({ where: { status: BookStatus.BINDING } });
    
      if (!books.length) {
        return { message: 'No books are currently in binding status' };
      }
    
      return books;
    }
  
    // Get a single book by ID
    async findOne(id: number): Promise<Book> {
      const book = await this.booksRepository.findOneBy({ id:id, status: BookStatus.PUBLISHED });
      if (!book) throw new NotFoundException('Book not found');
      return book;
    }


    async delete(id: number): Promise<{ message:string }> {
      const book = await this.booksRepository.findOneBy({ id });
      if (!book) throw new NotFoundException('Book not found');
      
      try {
        await this.booksRepository.remove(book);
        return { message: 'Book Deleted Successfully' };
      } 
      catch (error) {
        throw new Error(error)
      }

    }

  }