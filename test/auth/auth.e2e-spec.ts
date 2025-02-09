import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';
import { createTestDataSource } from '../setup';
import { Book } from '../../src/books/entities/book.entity';
import { Review } from '../../src/reviews/entities/review.entity';
import { Order } from '../../src/orders/entities/order.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
	const dataSource = await createTestDataSource([User, Book, Review, Order]);

	const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
		TypeOrmModule.forRoot({
			...dataSource.options,
			password: '',
			extra: {
			  trustServerCertificate: true, // For local testing
			}
		  } as unknown as TypeOrmModuleOptions),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
      })
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual('test@example.com');
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/auth/signup (POST) - invalid email', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test123!',
      })
      .expect(400);
  });
});
