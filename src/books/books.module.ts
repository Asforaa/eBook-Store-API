import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { ReviewsService } from 'src/reviews/reviews.service';
import { Review } from 'src/reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Review])],
  controllers: [BooksController],
  providers: [BooksService, ReviewsService],
  exports: [TypeOrmModule]
})
export class BooksModule {}
