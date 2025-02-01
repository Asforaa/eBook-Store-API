import { Controller, Get, Post, Param, Body, Patch, Delete, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
	  return this.usersService.create(createUserDto);
	}

	@Get()
	findAll() {
	  return this.usersService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
	  return this.usersService.update(+id, updateUserDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
	  return this.usersService.remove(+id);
	}
}
