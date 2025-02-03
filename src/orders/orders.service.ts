// src/orders/orders.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { CreateOrderDto } from './dtos/createOrder.dto';


@Injectable()
export class OrdersService {
    constructor(
      @InjectRepository(Order)
      private ordersRepository: Repository<Order>,
      @InjectRepository(Book)
      private booksRepository: Repository<Book>,
      @InjectRepository(User)
      private usersRepository: Repository<User>,

    ) {}
  
    async createOrder(
      createOrderDto: CreateOrderDto,
      buyer: User,
    ): Promise<Order> {
      const books = await Promise.all(
        createOrderDto.items.map(async (item) => {
          const book = await this.booksRepository.findOneBy({ id: item.bookId });
          if (!book) throw new NotFoundException(`Book ${item.bookId} not found`);
          if (book.status !== 'published') {
            throw new ForbiddenException(
              `Book ${book.title} is not available for purchase`,
            );
          }
          return { book, quantity: item.quantity };
        }),
      );
  
      const total = books.reduce(
        (sum, { book, quantity }) => sum + book.price * quantity,
        0,
      );
  
      const order = this.ordersRepository.create({
        buyer,
        books: books.map(({ book }) => book),
        total,
        status: OrderStatus.PENDING,
      });
  
      // in a realistic world the payment gateway goes here
      // For now, mark as COMPLETED immediately

      // we can even implement a Cart entity and save carts for users
      // and we can checkout the carts using different routes
      order.status = OrderStatus.COMPLETED;
      return this.ordersRepository.save(order);
    }
  
    async getOrdersByUser(user: User): Promise<Order[] | {message: string}> {
      
      const orders = await this.ordersRepository.find({
        where: { buyer: { id: user.id } },
        relations: ['books'],
      });

      if (!orders.length) return {message: 'You dont have any orders yet'};
      return orders;
    }
  
    async getOrderById(id: string, user: User): Promise<Order> {
      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: ['books', 'buyer'],
      });
      
      if (!order) throw new NotFoundException('Order not found');
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN &&
        order.buyer.id !== user.id
      ) {
        throw new ForbiddenException('You do not have access to this order');
      }
      return order;
    }

    async getAllSales() {
    
      const sales = await this.ordersRepository
        .createQueryBuilder('order')
        .leftJoin('order.books', 'book')
        .leftJoin('book.author', 'author')
        .select('book.id', 'bookId')
        .addSelect('book.title', 'bookTitle')
        .addSelect('book.price', 'bookPrice')
        .addSelect('SUM(order.total)', 'totalSales')
        .addSelect('COUNT(order.id)', 'totalOrders')
        .addSelect('author.username', 'authorUsername')
        .addSelect('author.id', 'authorId')
        .groupBy('book.id')
        .addGroupBy('author.username')  
        .addGroupBy('author.id')        
        .getRawMany();
    
  
    
      if (!sales || !sales.length) {
        return { message: 'No sales data available' };
      }
    
      return sales.map((sale) => ({
        bookId: sale.bookId,
        bookTitle: sale.bookTitle,
        bookPrice: parseFloat(sale.bookPrice),
        totalSales: parseFloat(sale.totalSales),
        totalOrders: parseInt(sale.totalOrders),
        authorUsername: sale.authorUsername,
        authorId: parseInt(sale.authorId),
      }));
    }
    
    async getAuthorSales(authorId: number) {
      
      const existingAuthor = await this.usersRepository.findOne({
        where: { id: authorId },
      });
      
      if (!existingAuthor) {
        throw new NotFoundException(`Author with ID ${authorId} not found`);
      }

      const sales = await this.ordersRepository
        .createQueryBuilder('order')
        .leftJoin('order.books', 'book')
        .where('book.authorId = :authorId', { authorId: authorId })
        .leftJoin('book.author', 'author')
        .select('book.id', 'bookId')
        .addSelect('book.title', 'bookTitle')
        .addSelect('book.price', 'bookPrice')
        .addSelect('SUM(order.total)', 'totalSales')
        .addSelect('COUNT(order.id)', 'totalOrders')
        .addSelect('author.username', 'authorUsername')
        .groupBy('book.id')
        .addGroupBy('author.username')
        .getRawMany();
    
      if (!sales || !sales.length) {
        return { message: 'No sales data available for your books' };
      }
    
      return sales.map((sale) => ({
        bookId: sale.bookId,
        bookTitle: sale.bookTitle,
        bookPrice: parseFloat(sale.bookPrice),
        totalSales: parseFloat(sale.totalSales),
        totalOrders: parseInt(sale.totalOrders),
        authorUsername: sale.authorUsername,
      }));
    }
    
}