import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { OrderResponseDto } from './dtos/orderResponse.dto';
  
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({path: 'orders', version: '2'})
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    @Post()
    @Roles(UserRole.BUYER)
    async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req): Promise<OrderResponseDto> {
      return this.ordersService.createOrder(createOrderDto, req.user);
    }
  
    @Get()
    @Roles(UserRole.BUYER)
    async getMyOrders(@Req() req): Promise<OrderResponseDto[] | {message: string}> {
      return this.ordersService.getOrdersByUser(req.user);
    }
    
    // sales tracking routes
    @Get('sales')
    @Roles(UserRole.ADMIN, UserRole.PUBLISHER)
    async getAllSales() {
      return this.ordersService.getAllSales();
    }


    @Get(':id')
    @Roles(UserRole.BUYER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getOrderById(@Param('id') id: string, @Req() req): Promise<OrderResponseDto> {
      return this.ordersService.getOrderById(id, req.user);
    }


    @Get('sales/:authorId')
    @Roles(UserRole.AUTHOR, UserRole.PUBLISHER, UserRole.ADMIN)
    async getAuthorSales(@Param('authorId', ParseIntPipe) authorId: number) {
      return this.ordersService.getAuthorSales(authorId);
    }

  }