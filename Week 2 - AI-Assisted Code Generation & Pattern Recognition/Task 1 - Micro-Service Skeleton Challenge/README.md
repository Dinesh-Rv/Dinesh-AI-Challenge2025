# User Management Microservice

A RESTful User Management microservice built with Node.js, Express, PostgreSQL, JWT authentication, Joi validation, Winston logging, and Jest for testing.

## Features
- User CRUD operations
- JWT authentication
- Input validation
- Centralized error handling
- Winston logging
- Unit tests with Jest

## Project Structure

- `src/config/` — Database config and schema
- `src/models/` — Database models
- `src/services/` — Business logic
- `src/controllers/` — HTTP controllers
- `src/routes/` — Express routes
- `src/middlewares/` — Auth, validation, error handling
- `src/tests/` — Jest tests

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.
   - Example:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_NAME=your_db_name
     JWT_SECRET=your_super_secret_key
     PORT=3000
     ```

---

## PostgreSQL Database Setup (Detailed)

### 1. Install PostgreSQL (if not already installed)
On Ubuntu:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start and enable PostgreSQL service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Switch to the postgres user
```bash
sudo -u postgres psql
```

### 4. Create a database user and database
In the psql prompt, run:
```sql
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
CREATE DATABASE your_db_name OWNER your_db_user;
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;
\q
```

### 5. (Optional) Change authentication method to password
If you encounter peer authentication errors, edit `/etc/postgresql/<version>/main/pg_hba.conf` and change `peer` to `md5` for local connections, then restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 6. Create the users table
From your project root, run:
```bash
psql -U your_db_user -d your_db_name -h localhost -f src/config/db.schema.sql
```

### 7. Test your connection
```bash
psql -U your_db_user -d your_db_name -h localhost
```
You should see the database prompt. To check the table:
```sql
\d users
```

---

5. **Start the server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

## API Endpoints

- `POST   /api/users/register` — Register a new user
- `POST   /api/users/login` — Login and get JWT
- `GET    /api/users` — Get all users (auth required)
- `GET    /api/users/:id` — Get user by ID (auth required)
- `PUT    /api/users/:id` — Update user (auth required)
- `DELETE /api/users/:id` — Delete user (auth required)

## Environment Variables
See `.env.example` for all required variables.

## License
MIT 