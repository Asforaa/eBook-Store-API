import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { BooksService } from 'src/books/books.service';
import { Book } from 'src/books/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Book])],
  controllers: [ReviewsController],
  providers: [ReviewsService, BooksService],
  exports: [TypeOrmModule]
})
export class ReviewsModule {}
