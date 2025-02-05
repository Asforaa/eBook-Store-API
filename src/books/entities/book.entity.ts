// book.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';

export enum BookStatus {
  BINDING = 'binding',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.BINDING })
  status: BookStatus;

  @Column({ nullable: true })
  ebookFileUrl: string;

  @ManyToOne(() => User, (user) => user.authoredBooks)
  @JoinColumn()
  author: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  publishedBy?: Partial<User>;

  @OneToMany(() => Review, (review) => review.book, { cascade: true })
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;
}