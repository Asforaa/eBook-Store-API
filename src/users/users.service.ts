import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { hashPassword } from '../common/utils/hash.util';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>
	) {}


	async updateRole( userId: number, newRole: UserRole, currentUser: User): Promise<User> {

		// can use findoneByOrFail here
		const targetUser = await this.usersRepository.findOneBy({ id: userId });
		if (!targetUser) throw new NotFoundException('User not found');

		// Admins can only assign author/publisher roles
		if (
		currentUser.role === UserRole.ADMIN &&
		![UserRole.AUTHOR, UserRole.PUBLISHER, UserRole.BUYER].includes(newRole)
		) {
		throw new ForbiddenException(
			'Admins can only assign author, publisher or buyer roles',
		);
		}

		// Prevent admins from modifying other admins/super_admins
		if (
			currentUser.role === UserRole.ADMIN
			&& [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(targetUser.role)
		) {
		throw new ForbiddenException(
			'Admins cannot modify roles of other admins or super admins',
		);
		}

		// Super admins can assign any role except demoting other super admins
		if (
		currentUser.role === UserRole.SUPER_ADMIN &&
		targetUser.role === UserRole.SUPER_ADMIN &&
		newRole !== UserRole.SUPER_ADMIN
		) {
		throw new ForbiddenException('Cannot demote a super admin');
		}

		targetUser.role = newRole;
		return this.usersRepository.save(targetUser);
	}


	async create(createUserDto: CreateUserDto): Promise<Partial<User>> {

		// try {
		// 	await this.usersRepository.save(user);
		// }
		// catch (error) {
		// 	if (error.code === '23505') {
		// 		// 23505 is the PostgreSQL error code for unique constraint violations
		// 		if (error.detail.includes('username')) {
		// 			throw new ConflictException('Username is already taken');
		// 		} else if (error.detail.includes('email')) {
		// 			throw new ConflictException('Email is already in use');
		// 		}
		// 	}

		// 	throw error;
		// }

		// a cleaner way to check if the username or email already exists using typeORM
		// refactored: now this compares using the data from the DTO instead of creating a new user and comparing using it
		const existingUser = await this.usersRepository.findOne({
			where: [{ username: createUserDto.username }, { email: createUserDto.email }],
		  });

		  if (existingUser) {
			if (existingUser.username === createUserDto.username) {
			  throw new ConflictException('Username is already taken');
			}
			if (existingUser.email === createUserDto.email) {
			  throw new ConflictException('Email is already in use');
			}
		}

		// hash for security yk
		const hashedPassword = await hashPassword(createUserDto.password);
		const user = this.usersRepository.create({
			...createUserDto,
			password: hashedPassword,
		});

		// save the user in the db
		await this.usersRepository.save(user);

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

		// removed the try-catch block because its necessary to handle the same error twice
		const result = await this.usersRepository.delete(id);

		// already handling the not found error here
		if (result.affected === 0) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return { message: `User with ID ${id} deleted successfully` };
	}


		// catch (error) {
		// 	if (error instanceof NotFoundException) {
		// 		throw new NotFoundException(error.message);
		// 	}
		// 	throw error;
		// }



}
