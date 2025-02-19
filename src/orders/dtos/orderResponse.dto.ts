import { Exclude, Expose } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

@Exclude()
export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  total: number;

  @Expose()
  status: OrderStatus;

  @Expose()
  createdAt: Date;
}