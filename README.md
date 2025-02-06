# eBook Store API

A simple eBook store backend built with **NestJS**, featuring JWT authentication, role-based API calls, and CRUD operations for users and books.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Author, Buyer)
- **User Management**
  - Signup & Login
  - Update/Delete User
  - Role Assignment
- **Book Management**
  - CRUD operations for books
  - Books linked to authors
- **Order Management** (Future Enhancement)
  - Users can purchase books
  - Payment integration (Planned)

## Technologies Used

- **NestJS** - Framework for scalable Node.js applications
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database management
- **TypeORM** - ORM for database interactions
- **JWT** - Secure authentication
- **Docker** - Containerized development & deployment

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Asforaa/eBook-Store-API.git
   cd eBook-Store-API
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up the environment variables:**

   - **Copy the example environment file:**
     ```sh
     cp .env.example .env
     ```

   - **Generate a JWT secret:**
     ```sh
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     Copy the output and use it in the `.env` file.

   - **Configure database credentials & JWT secret:**
     Open the `.env` file and set the following variables:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=your_db_username # most likely will be "postgres"
     DB_NAME=ebook_store
     DB_PASSWORD=your_db_password
     JWT_SECRET=your_generated_jwt_secret
     ```

4. **Create and verify the PostgreSQL database:**

   - **Access the PostgreSQL command-line interface:**
     ```sh
     sudo -u postgres psql
     ```

   - **Create the database:**
     ```sql
     CREATE DATABASE ebook_store;
     ```

   - **Verify the database creation:**
     ```sql
     \l
     ```
     Ensure that `ebook_store` is listed among the databases.

   - **Exit the PostgreSQL CLI:**
     ```sql
     \q
     ```

5. **Run the application:**
   ```sh
   npm run start:dev
   ```

## API Documentation

Comprehensive API documentation is available. Access it here:
- [API Documentation](https://documenter.getpostman.com/view/41731674/2sAYX6oMJF)

### Example API Endpoints

#### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Authenticate and receive a JWT

#### Users
- `GET /users` - Retrieve all users (Admin only)
- `PATCH /users/:id` - Update user details
- `DELETE /users/:id` - Delete a user

#### Books
- `POST /books` - Create a book (Authors only)
- `GET /books` - Retrieve all books
- `PATCH /books/:id` - Update a book (Author or Admin)
- `DELETE /books/:id` - Delete a book (Admin only)

## Running with Docker

1. **Build and start the Docker containers:**
   ```sh
   docker-compose up --build
   ```

2. **Access the application:**
   The app will be available at `http://localhost:3000`

## Testing

- **Run unit tests:**
  ```sh
  npm run test
  ```

- **Run end-to-end tests:**
  ```sh
  npm run test:e2e
  ```

## Contributing

1. **Fork the repository**
2. **Create a new feature branch:**
   ```sh
   git checkout -b feature-name
   ```
3. **Commit your changes:**
   ```sh
   git commit -m 'Add new feature'
   ```
4. **Push to the branch:**
   ```sh
   git push origin feature-name
   ```
5. **Create a pull request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

