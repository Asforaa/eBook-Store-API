import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Book } from 'src/books/entities/book.entity';
import { Review } from 'src/reviews/entities/review.entity';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany
} from 'typeorm';

export enum UserRole {
	AUTHOR = 'author',
	BUYER = 'buyer',
	PUBLISHER = 'publisher',
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	@IsNotEmpty()
	username: string;

	@Column({ unique: true })
	@IsEmail()
	email: string;

	@Column()
	@IsNotEmpty()
	@Exclude()
	password: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
	@IsEnum(UserRole)
	role: UserRole;

	@OneToMany(() => Book, (book) => book.author)
	authoredBooks: Book[];

	@OneToMany(() => Review, (review) => review.buyer)
	reviews: Review[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
  }
