# eBook Store API

A simple eBook store backend built with **NestJS**, featuring JWT authentication, role-based API calls, and CRUD operations for users and books.

The aim of this project is to apply the skills I learn in my NestJS journey.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Super Admin, Admin, Publisher, Author, Buyer)
- **User Management**
  - Signup & Login
  - Update/Delete User
  - Role Assignment
- **Book Management**
  - CRUD operations for books
  - Books linked to authors
- **Book Reviews Managament**
  - CRUD operations for reviews
  - Reviews linked to books and users
- **Order Management**
  - Users can create book orders
  - Users can track their order history
  - Admins can track all the sales
  - Authors can track the sales of their books

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
   ```

```
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

   - **Download PostgresSQL:**

   - [Official download link](https://www.postgresql.org/download/)

## Access the PostgreSQL command-line interface:

### For Windows:

```sh
sudo -u postgres psql
```

### For macOS:

#### Ensure PostgreSQL is Installed:

If PostgreSQL is not already installed, you can install it using Homebrew.

```bash
brew install postgresql
```

#### Start PostgreSQL Service:

Start the PostgreSQL service using Homebrew.

```bash
brew services start postgresql
```

#### Initialize the Database:

Initialize the PostgreSQL database in your current directory. You can specify a directory within your current project to store the database files.

```bash
initdb ./postgres_data
```

#### Access PostgreSQL Command-Line Interface:

Open the PostgreSQL command-line interface (CLI) using the `psql` command.

```bash
psql postgres
```

### For Linux:

#### Ensure PostgreSQL is Installed:

If PostgreSQL is not already installed, you can install it using your package manager.

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

#### Start PostgreSQL Service:

Start the PostgreSQL service.

```bash
sudo service postgresql start
```

#### Initialize the Database:

Initialize the PostgreSQL database.

```bash
sudo -u postgres initdb -D /var/lib/postgres/data
```

#### Access PostgreSQL Command-Line Interface:

Open the PostgreSQL command-line interface (CLI) using the `psql` command.

```bash
sudo -u postgres psql
```

## Create the database:

```sql
CREATE DATABASE ebook_store;
```

## Verify the database creation:

```sql
\l
```

Ensure that `ebook_store` is listed among the databases.

## Exit the PostgreSQL CLI:

```sql
\q
```

## Run the application:

```sh
npm run start:dev
```

Remember, if you don't update the database variables in the `.env` file, you will get the following error in a repetitive manner:

```
ERROR [TypeOrmModule] Unable to connect to the database. Retrying...

ERROR [ExceptionHandler] error: role "postgres" does not exist
```

If you face this issue, stop running the application by pressing `CTRL + C`.

5. **Run the application:**
   ```sh
   npm run start:dev
   ```

## API Documentation

Comprehensive API documentation with saved responses is available. Access it here:

- [API Documentation](https://documenter.getpostman.com/view/41731674/2sAYX6oMJF)

### Example API Endpoints

#### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Authenticate and receive a JWT

#### Users (Admin only)

- `GET /users` - Retrieve all users
- `GET /users/:id` - Retrieve a user by id
- `PATCH /users/:id` - Update user details
- `DELETE /users/:id` - Delete a user (Super Admins only)

#### Books

- `POST /books` - Create a book (Authors only)
- `GET /books` - Retrieve all books
- `GET /books/:id` - Retrieve a book by id
- `GET /books/binding` - Retrieve all binding books
- `PATCH /books/:id` - Update a book (Author or Admin)
- `PATCH /books/:id/status` - Update the published status of a book (Publishers)
- `DELETE /books/:id` - Delete a book (Admin only)

you can view the rest of the endpoints in the [API Documentation](https://documenter.getpostman.com/view/41731674/2sAYX6oMJF)

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

---

### Unit Tests Overview

The project contains unit tests for two key services: **AuthService** and **UsersService**. These tests ensure that our authentication logic and user management work as expected under various conditions.

#### AuthService Unit Tests

- **Purpose:**
  These tests verify the core authentication features, namely user registration (signup) and login.

- **What’s Covered:**

  - **Signup Tests:**

    - Confirm that a new user is registered successfully with their password being hashed.
    - Ensure that users cannot sign up with a disallowed role (e.g., trying to register as an admin when that isn’t permitted).
    - Detect duplicate usernames or emails by throwing appropriate conflict errors.

  - **Login Tests:**
    - Validate that valid credentials return an access token (JWT).
    - Check that providing an incorrect username or password results in an unauthorized error.

- **Why It Matters:**
  These tests guarantee that the authentication process securely hashes passwords, generates tokens correctly, and handles common error cases such as duplicate entries or invalid credentials.

#### UsersService Unit Tests

- **Purpose:**
  These tests focus on user management functions, such as updating user roles, creating new users, retrieving users, and deleting users.

- **What’s Covered:**

  - **Role Update Tests:**

    - Verify that an admin cannot change the role of another admin, ensuring that only authorized users (like super admins) can modify user roles.
    - Confirm that a super admin can update roles correctly.
    - Prevent scenarios like demoting a super admin, which are restricted by business rules.

  - **User Creation Tests:**

    - Check that the service detects if a username already exists (to avoid duplicate entries).
    - Ensure that the password is hashed before a new user is saved, and that the response does not include sensitive password information.

  - **Error Handling Tests:**
    - Confirm that trying to find a non-existent user throws a "Not Found" error.
    - Verify that attempting to delete a user who isn’t in the database results in an appropriate error.
    - Test that when retrieving lists of users, sensitive fields (like the password) are excluded from the output.

- **Why It Matters:**
  These tests help ensure that user-related operations enforce proper security and business rules. They verify that the application does not allow unauthorized modifications, correctly handles duplicates, and formats user responses safely.

---

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
