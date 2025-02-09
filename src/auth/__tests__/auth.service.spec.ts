import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dtos/createUser.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.BUYER,
    authoredBooks: [],
    orders: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // Add typeorm-specific methods if needed
    hasId: () => true,
    save: () => Promise.resolve(this),
    remove: () => Promise.resolve(this),
    reload: () => Promise.resolve(this),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockImplementation(dto => ({
              ...dto,
              id: 1,
              authoredBooks: [],
              orders: [],
              reviews: [],
              createdAt: new Date(),
              updatedAt: new Date()
            })),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn().mockResolvedValue(mockUser)
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token')
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      role: UserRole.BUYER
    };

    it('should successfully register a user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.signup(createUserDto);
      expect(result).toEqual({ message: 'User successfully registered' });
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword'
      });
    });

    it('should prevent admin role signup', async () => {
      await expect(service.signup({ ...createUserDto, role: UserRole.ADMIN }))
        .rejects.toThrow(ForbiddenException);
    });

    it('should detect duplicate username', async () => {
      jest.spyOn(usersRepository, 'save').mockRejectedValueOnce({
        code: '23505',
        detail: 'Key (username)=(testuser) already exists'
      });

      await expect(service.signup(createUserDto))
        .rejects.toThrow(ConflictException)
        .catch(e => expect(e.message).toBe('Username is already taken'));
    });

    it('should detect duplicate email', async () => {
      jest.spyOn(usersRepository, 'save').mockRejectedValueOnce({
        code: '23505',
        detail: 'Key (email)=(test@example.com) already exists'
      });

      await expect(service.signup(createUserDto))
        .rejects.toThrow(ConflictException)
        .catch(e => expect(e.message).toBe('Email is already in use'));
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login('testuser', 'password');
      expect(result).toEqual({ access_token: 'mock-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
        role: UserRole.BUYER
      });
    });

    it('should reject invalid username', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.login('wronguser', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login('testuser', 'wrongpass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
