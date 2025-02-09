import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Book } from '../../books/entities/book.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
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
	ADMIN = 'admin',
	SUPER_ADMIN = 'super_admin'
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

	@Exclude()
	@Column({ select: false })
	@IsNotEmpty()
	password: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
	@IsEnum(UserRole)
	role: UserRole;

	@OneToMany(() => Book, (book) => book.author)
	authoredBooks: Book[];

	@OneToMany(() => Order, (order) => order.buyer)
	orders: Order[];

	@OneToMany(() => Review, (review) => review.buyer)
	reviews: Review[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
