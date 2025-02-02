import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords, hashPassword } from 'src/common/utils/hash.util';
import { CreateUserDto } from 'src/users/dtos/createUser.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}


  async signup(createUserDto: CreateUserDto): Promise<{message: string}> {
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
        } else {
          
        }
      }

      throw error;
    }

    return { message: 'User successfully registered' };
  }


  async login(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
