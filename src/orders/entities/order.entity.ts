import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

export enum OrderStatus {
PENDING = 'pending',
COMPLETED = 'completed',
CANCELLED = 'cancelled',
}
  
  @Entity()
  export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn()
    buyer: User;
  
    @ManyToMany(() => Book)
    @JoinTable()
    books: Book[];
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;
  
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  } 