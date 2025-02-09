// mock the bcrypt functionality to give more realistic behavior while maintaining type safety
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password: string) =>
    Promise.resolve(`hashed-${password}`)
  ),
  compare: jest.fn().mockImplementation((plainText, hash) =>
    Promise.resolve(hash === `hashed-${plainText}`)
  )
}));

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  instanceToPlain: (obj: any) => {
    if (Array.isArray(obj)) {
      return obj.map(item => {
        const { password, ...rest } = item;
        return rest;
      });
    }
    const { password, ...rest } = obj;
    return rest;
  }
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users.service';
import { User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    username: 'testadmin',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    password: 'hashedPassword',
    authoredBooks: [],
    orders: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // TypeORM entity methods
    hasId: () => true,
    save: () => Promise.resolve(this),
    remove: () => Promise.resolve(this),
    reload: () => Promise.resolve(this),
  } as User;




  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            findOneBy: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
            findOneOrFail: jest.fn().mockRejectedValue(new Error()),
            create: jest.fn().mockImplementation(dto => ({
              ...dto,
              id: 1,
              authoredBooks: [],
              orders: [],
              reviews: [],
              createdAt: new Date(),
              updatedAt: new Date()
            })),
            save: jest.fn().mockImplementation(user => Promise.resolve(user)),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 })
          }
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('updateRole', () => {
    const adminUser = { id: 2, role: UserRole.ADMIN } as User;
    const superAdminUser = { id: 3, role: UserRole.SUPER_ADMIN } as User;

    it('should prevent admin from modifying other admins', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce({
        id: 1,
        role: UserRole.ADMIN
      } as User);

      await expect(service.updateRole(1, UserRole.AUTHOR, adminUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should allow super admin to modify roles', async () => {
      const targetUser = { id: 1, role: UserRole.AUTHOR } as User;
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(targetUser);

      const result = await service.updateRole(1, UserRole.PUBLISHER, superAdminUser);
      expect(result.role).toBe(UserRole.PUBLISHER);
    });

    it('should prevent demoting super admin', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce({
        id: 1,
        role: UserRole.SUPER_ADMIN
      } as User);

      await expect(service.updateRole(1, UserRole.ADMIN, superAdminUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should detect existing username before create', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        username: 'existinguser'
      });

      await expect(service.create({
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password',
        role: UserRole.BUYER
      })).rejects.toThrow(ConflictException);
    });

    it('should hash password before saving', async () => {
      const result = await service.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'plaintext',
        role: UserRole.BUYER
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(result.password).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should throw NotFound for non-existent user', async () => {
      jest.spyOn(repository, 'findOneOrFail').mockRejectedValue(new Error());

      await expect(service.findOne(999))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should handle missing user on delete', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(999))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('response formatting', () => {
    it('should exclude password from responses', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([{
        ...mockUser,
        password: 'hashedPassword' // Explicitly include password
      }]);

      const result = await service.findAll();
      expect(result[0].password).toBeUndefined();
    });
  });

});
