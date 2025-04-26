# Smart Study Planner

A modern web application that creates personalized study schedules based on course deadlines, availability, and difficulty of topics. Designed with a beautiful, responsive UI and intelligent scheduling algorithms.

![Smart Study Planner Screenshot](images/screenshot.png)

## Features

### Core Functionality
- Add multiple courses with deadlines, difficulty levels, and topics
- Specify hours available per week for each course
- Automatically generate a personalized weekly study schedule
- Schedule prioritizes courses based on deadlines and difficulty
- Daily study sessions with recommended topics
- Progress tracking for each course with visual indicators
- Edit and update existing courses with automatic schedule regeneration
- Responsive design that works on desktop and mobile devices

### User Experience
- Modern UI with gradient backgrounds and smooth animations
- Interactive form validation with visual feedback
- Animated course cards with staggered appearance
- Dynamic countdown timers for course deadlines
- Study tips section with best practices
- Visual indicators for course difficulty and progress
- Smooth transitions and hover effects throughout the application
- Notification system for actions (success, warnings, errors)

### Authentication
- User authentication with email/password
- Social login integration (Google, GitHub)
- Secure password management
- User profiles with personalized data
- Session management and secure logout

### Data Management
- Local storage for offline functionality
- Backend API integration for cloud storage (when available)
- Data persistence with automatic saving
- Import/export functionality for backup

## Latest Improvements

### UI Enhancements
- **Optimized Layout**: Removed excess white space and improved spacing throughout
- **Dynamic Form Interactions**: Added visual feedback during form submission
- **Enhanced Course Cards**: Redesigned with better organization and visual hierarchy
- **Improved Responsiveness**: Optimized for all device sizes with adaptive grid layouts
- **Animation System**: Added staggered animations for smoother loading experiences

### Functional Improvements
- **Form Validation**: Added real-time validation with clear error messages
- **Progress Tracking**: Implemented course progress visualization
- **Intelligent Tips**: Added study tips section that appears only once
- **Edit Mode**: Enhanced course editing with visual indicators
- **Optimized Rendering**: Fixed duplicate elements issue when adding/updating courses
- **Date Validation**: Prevents selecting past dates for deadlines

### Performance Optimizations
- Reduced unnecessary DOM operations
- Optimized animations for better performance
- Improved memory usage by preventing duplicate elements
- Enhanced rendering algorithm for course lists

## Project Architecture

The application follows a modern architecture with a clean separation between frontend and backend components:

### Frontend (Client-Side)
- Pure HTML, CSS, and JavaScript implementation
- Responsive design with CSS Grid and Flexbox
- Client-side state management for offline usage
- Progressive features that work with or without backend connection

### Backend (Server-Side)
- Node.js with Express framework
- RESTful API architecture
- MongoDB database with Mongoose ODM
- JWT authentication system
- OAuth integration for social logins

## How to Use

1. **Create an Account or Login**
   - Register with your email and password
   - Alternatively, login with Google or GitHub
   - Your data will be synced across devices when logged in

2. **Add Your Courses**
   - Enter the course name, deadline, difficulty level, and topics
   - Specify how many hours you can dedicate to this course weekly
   - Click "Add Course" to save the course
   - Receive immediate visual feedback during submission

3. **View and Manage Your Courses**
   - All added courses appear in the "Your Courses" section with a modern card layout
   - Courses are sorted by deadline (earliest first)
   - Each course displays its deadline, difficulty, topics, and progress
   - Edit existing courses by clicking the edit button
   - Delete courses using the trash icon
   - View countdown timers showing days remaining until deadlines

4. **Generate Your Schedule**
   - Click the "Generate Schedule" button
   - The app will create a personalized 7-day study schedule
   - Each day shows recommended study sessions with times and topics
   - The schedule updates automatically when courses are added, edited, or deleted
   - Dynamic time allocation based on course priority and availability

## How It Works

The schedule generation algorithm takes into account:
- Course deadlines (closer deadlines get higher priority)
- Difficulty levels (harder courses get more study time)
- Available hours per week (distributed optimally across days)
- Topics (intelligently selected for each study session)
- Progress tracking (allocates more time to less complete courses)

The UI experience is enhanced with:
- Staggered animations for smoother loading
- Visual feedback for user interactions
- Contextual color coding for deadlines, difficulty, and progress
- Responsive grid layout that adapts to screen size
- Form validation with helpful error messages

## Technologies Used

### Frontend
- HTML5 (Semantic markup)
- CSS3 (Variables, Flexbox, Grid, Animations)
- JavaScript (ES6+, Modern APIs)
- Local Storage API for offline data persistence
- Responsive design principles
- Modern UI components and animations

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication system
- Passport.js for OAuth integration
- RESTful API endpoints

## Installation

### Local Development (Frontend Only)
1. Clone the repository
2. Open `index.html` in your web browser to access the application
3. No build tools required for frontend development

### Full Stack Development
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with required configuration (see below)
4. Start the development server: `npm run dev`
5. For production: `npm start`

### Backend Configuration (.env)
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

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login user
- **GET /api/auth/me** - Get current user's profile
- **GET /api/auth/logout** - Logout user
- **GET /api/auth/google** - Google OAuth login
- **GET /api/auth/google/callback** - Google OAuth callback
- **GET /api/auth/github** - GitHub OAuth login
- **GET /api/auth/github/callback** - GitHub OAuth callback

### Courses Endpoints

- **GET /api/courses** - Get all courses for logged in user
- **GET /api/courses/:id** - Get single course
- **POST /api/courses** - Create new course
- **PUT /api/courses/:id** - Update course
- **DELETE /api/courses/:id** - Delete course
- **PUT /api/courses/:id/progress** - Update course progress

### Schedules Endpoints

- **GET /api/schedules** - Get all schedules for logged in user
- **GET /api/schedules/:id** - Get single schedule
- **POST /api/schedules** - Create new schedule
- **PUT /api/schedules/:id** - Update schedule
- **DELETE /api/schedules/:id** - Delete schedule
- **PUT /api/schedules/:id/items/:itemId** - Update schedule item completion status
- **GET /api/courses/:courseId/schedules** - Get all schedules for a specific course
- **POST /api/courses/:courseId/generate-schedule** - Generate a study schedule for a course

### Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token.

To authenticate requests, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Data Models

### User Model
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

### Course Model
- name
- deadline
- difficulty (1-3)
- topics (array)
- hoursAvailable
- completedTopics (array)
- progress (0-100)
- user (reference to User)
- createdAt

### Schedule Model
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

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - Feel free to use, modify, and distribute this code for personal or commercial projects.

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- The open source community for inspiration 