import { IsEnum } from 'class-validator';
import { BookStatus } from '../entities/book.entity';

export class UpdateBookStatusDto {
  @IsEnum(BookStatus, {
    message: 'Status must be "published" or "rejected"',
  })
  status: BookStatus.PUBLISHED | BookStatus.REJECTED;
}