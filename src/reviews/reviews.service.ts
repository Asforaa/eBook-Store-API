import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Book, BookStatus } from 'src/books/entities/book.entity';
import { CreateReviewDto } from './dtos/createReview.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateReviewDto } from './dtos/updateReview.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,

    ){}

    async create(createReviewDto: CreateReviewDto, buyer: User): Promise<Review> {
        const book = await this.booksRepository.findOneBy({
          id: createReviewDto.bookId,
          status: BookStatus.PUBLISHED,
        });
        if (!book) throw new NotFoundException('Book not found or not published');
    
        // TODO: Check if the buyer has purchased the book (requires orders entity)
        const review = this.reviewsRepository.create({
          ...createReviewDto,
          buyer,
          book,
        });
        return this.reviewsRepository.save(review);
    }

    async update(id: number, updateReviewDto: UpdateReviewDto, buyer: User): Promise<Review> {
        const review = await this.reviewsRepository.findOne({ where: { id }, relations: ['buyer'] });
        if (!review) throw new NotFoundException('Review not found');
        if (review.buyer.id !== buyer.id)
          throw new ForbiddenException('Access denied');
    
        Object.assign(review, updateReviewDto);
        return this.reviewsRepository.save(review);
    }

    async delete(id: number, buyer: User): Promise<void> {
        const review = await this.reviewsRepository.findOne({ where: { id }, relations: ['buyer'] });
        if (!review) throw new NotFoundException('Review not found');
        if (review.buyer.id !== buyer.id)
          throw new ForbiddenException('Access denied');
    
        await this.reviewsRepository.remove(review);
    }
}
