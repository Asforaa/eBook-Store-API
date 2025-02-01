import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { hashPassword } from 'src/common/utils/hash.util';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>
	) {}

	async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
		// hash for security yk
		const hashedPassword = await hashPassword(createUserDto.password);
		const user = this.usersRepository.create({
			...createUserDto,
			password: hashedPassword,
		});

		try {
			await this.usersRepository.save(user);
		}
		catch (error) {
			if (error.code === '23505') {
				// 23505 is the PostgreSQL error code for unique constraint violations
				if (error.detail.includes('username')) {
					throw new ConflictException('Username is already taken');
				} else if (error.detail.includes('email')) {
					throw new ConflictException('Email is already in use');
				}
			}

			throw error;
		}

		// Exclude password hash from the response, because why would I send it lmao
		return instanceToPlain(user);
	}

	async findAll(): Promise<Partial<User>[]> {
		const users = await this.usersRepository.find();
		return instanceToPlain(users) as Partial<User>[];
	}

	async findOne(id: number): Promise<User> {
		try {
			return await this.usersRepository.findOneOrFail({ where: { id } });
		} catch (error) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
		try {
			await this.usersRepository.update(id, updateUserDto);
			const user = await this.usersRepository.findOne({ where: { id } });


			if (!user) {
				throw new NotFoundException(`User with ID ${id} not found`);
			}

			//exclude password hash from the response, because why would i send it lmao
			return instanceToPlain(user);

		}
		catch (error) {
			if (error instanceof NotFoundException) {
			  throw new NotFoundException(`User with ID ${id} not found`);
			}

			throw error;
		  }
	  }

	async remove(id: number): Promise<{message: string}> {
		try {
			const result = await this.usersRepository.delete(id);

			if (result.affected === 0) {
				throw new NotFoundException(`User with ID ${id} not found`);
			}
			return { message: `User with ID ${id} deleted successfully` };
		}
		catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException(error.message);
			}
			throw error;
		}
	}


}
