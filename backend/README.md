# Smart Study Planner Backend

Backend API for the Smart Study Planner application using Node.js and Microsoft SQL Server.

## Technologies Used

- Node.js
- Express.js
- Microsoft SQL Server
- JWT Authentication
- bcryptjs for password hashing
- Passport.js for authentication strategies

## Setup

### Prerequisites

- Node.js and npm installed
- Microsoft SQL Server installed and running
- SQL Server Management Studio (SSMS) or Azure Data Studio (optional, for managing the database)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server settings
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# MS SQL Server settings
SQL_SERVER=localhost
SQL_DATABASE=SmartStudyPlanner
SQL_USER=sa
SQL_PASSWORD=YourStrongPassword
SQL_PORT=1433
SQL_ENCRYPT=false
```

Replace the placeholder values with your actual configuration.

### Database Setup

1. Create a new database in SQL Server named `SmartStudyPlanner`
2. Run the SQL scripts in the `database/scripts` folder to create the necessary tables:
   - `01_create_tables.sql`
   - `02_create_stored_procedures.sql`

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. The server will start on the port defined in your `.env` file (default: 5000)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user's profile (requires authentication)

### Courses

- `GET /api/courses` - Get all courses for the logged-in user
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

## Authentication Flow

The application uses JWT (JSON Web Token) for authentication. When a user logs in, a token is generated and returned to the client. This token must be included in the Authorization header for protected routes:

```
Authorization: Bearer [token]
```

## Security

- Passwords are hashed using bcryptjs before storing in the database
- JWT is used for maintaining user sessions
- SQL parameters are used to prevent SQL injection
- Input validation is implemented for all API requests 