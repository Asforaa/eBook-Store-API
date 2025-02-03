// src/reviews/reviews.controller.ts
import {
    Controller,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateReviewDto } from './dtos/createReview.dto';
import { UpdateReviewDto } from './dtos/updateReview.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';


@UseGuards(JwtAuthGuard)
@Controller({ path:'reviews', version: '1' })
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.BUYER)
    async createReview(@Body() createReviewDto: CreateReviewDto, @Req() req) {
      return this.reviewsService.create(createReviewDto, req.user);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.BUYER)
    async updateReview(
      @Param('id') id: number,
      @Body() updateReviewDto: UpdateReviewDto,
      @Req() req,
    ) {
      return this.reviewsService.update(id, updateReviewDto, req.user);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.BUYER, UserRole.ADMIN)
    async deleteReview(@Param('id') id: number, @Req() req) {
      await this.reviewsService.delete(id, req.user);
      return {  "message": "User with ID 1 deleted successfully"}
    }
}