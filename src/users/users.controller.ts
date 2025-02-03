import { Controller, Get, Post, Param, Body, Patch, Delete, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRoleDto } from './dtos/updateRole.dto';

@UseGuards(JwtAuthGuard)
@Controller({ path:'users', version: '1' })
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Patch(':id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async updateUserRole(@Param('id') userId: number, @Body() updateRoleDto: UpdateRoleDto, @Req() req) {
	  return this.usersService.updateRole(userId, updateRoleDto.role, req.user);
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
	  return this.usersService.create(createUserDto);
	}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	findAll() {
	  return this.usersService.findAll();
	}

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	async findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
	  return this.usersService.update(+id, updateUserDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
	  return this.usersService.remove(+id);
	}
}
