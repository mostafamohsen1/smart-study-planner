# Smart Study Planner Backend

This is the backend server for the Smart Study Planner application. It provides a RESTful API for managing user accounts, courses, and study schedules.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Passport.js (for OAuth)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartStudyPlanner
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   CLIENT_URL=http://localhost:3000
   ```

3. Start the server:
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login user
- **GET /api/auth/me** - Get current user's profile
- **GET /api/auth/logout** - Logout user
- **GET /api/auth/google** - Google OAuth login
- **GET /api/auth/google/callback** - Google OAuth callback
- **GET /api/auth/github** - GitHub OAuth login
- **GET /api/auth/github/callback** - GitHub OAuth callback

### Courses

- **GET /api/courses** - Get all courses for logged in user
- **GET /api/courses/:id** - Get single course
- **POST /api/courses** - Create new course
- **PUT /api/courses/:id** - Update course
- **DELETE /api/courses/:id** - Delete course
- **PUT /api/courses/:id/progress** - Update course progress

### Schedules

- **GET /api/schedules** - Get all schedules for logged in user
- **GET /api/schedules/:id** - Get single schedule
- **POST /api/schedules** - Create new schedule
- **PUT /api/schedules/:id** - Update schedule
- **DELETE /api/schedules/:id** - Delete schedule
- **PUT /api/schedules/:id/items/:itemId** - Update schedule item completion status
- **GET /api/courses/:courseId/schedules** - Get all schedules for a specific course
- **POST /api/courses/:courseId/generate-schedule** - Generate a study schedule for a course

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token.

OAuth login with Google and GitHub is also supported.

To authenticate requests, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Models

### User

- name
- email
- password (hashed)
- googleId
- githubId
- avatar
- role (user or admin)
- resetPasswordToken
- resetPasswordExpire
- twoFactorEnabled
- twoFactorSecret
- createdAt

### Course

- name
- deadline
- difficulty (1-3)
- topics (array)
- hoursAvailable
- completedTopics (array)
- progress (0-100)
- user (reference to User)
- createdAt

### Schedule

- name
- course (reference to Course)
- user (reference to User)
- items (array of ScheduleItems)
- startDate
- endDate
- createdAt
- lastUpdated

#### ScheduleItem

- day
- startTime
- endTime
- topic
- completed 