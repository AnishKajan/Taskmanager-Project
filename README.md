# ACCIONLABSPROJECT - Task Management Application

A full-stack collaborative task management web application built with Node.js, React, TypeScript, and MongoDB. The application features real-time task collaboration, user authentication, privacy settings, and comprehensive testing with Jest.

## 🚀 Features

### ✨ Core Functionality
- **User Authentication**: Secure signup/login with JWT tokens
- **Task Management**: Create, edit, delete, and archive tasks
- **Real-time Status Updates**: Tasks automatically update status based on time
- **Date & Time Management**: Schedule tasks with start and end times
- **Recurring Tasks**: Support for daily, weekly, monthly, yearly, and weekday patterns

### 👥 Collaborative Features
- **Task Collaboration**: Add other users as collaborators on tasks
- **Privacy Controls**: Public/private user profiles control collaboration permissions
- **Shared Task Management**: Collaborators can view, edit, and delete shared tasks
- **Cross-user Visibility**: Tasks appear in all collaborators' dashboards and archives

### 🎨 User Interface
- **Responsive Design**: Mobile-friendly Material-UI interface
- **Custom Avatars**: User profile pictures with color customization
- **Drag & Drop**: Beautiful task cards with react-beautiful-dnd
- **Multi-tab Layout**: Separate views for Work, School, and Personal tasks
- **Archive System**: Automatic task archival with 5-day deletion policy

### 🔧 Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **MongoDB Integration**: Robust data persistence with proper indexing
- **Docker Containerization**: Easy deployment and development setup
- **Comprehensive Testing**: Jest test suite for frontend components
- **Error Handling**: Graceful error management and user feedback

## 📁 Project Structure

```
ACCIONLABSPROJECT/
│
├── backend/
│   ├── db/
│   │   └── mongoClient.js          # MongoDB connection configuration
│   ├── routes/
│   │   ├── auth.js                 # Authentication endpoints (signup/login)
│   │   ├── tasks.js                # Task CRUD operations with collaboration
│   │   └── users.js                # User management and privacy settings
│   ├── test/
│   │   ├── basic.test.js           # Basic backend functionality tests
│   │   ├── setup.js                # Test environment setup
│   │   ├── tasks.test.js           # Task route testing
│   │   └── test-tasks-router.js    # Task router integration tests
│   ├── .env                        # Environment variables
│   ├── .env.test                   # Test environment variables
│   ├── docker-compose.yml          # Backend containerization
│   ├── Dockerfile                  # Backend Docker configuration
│   ├── insertUser.js               # User seeding utility
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html              # React app entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTaskModal.tsx    # Task creation modal
│   │   │   ├── EditTaskModal.tsx   # Task editing modal
│   │   │   └── SettingsModal.tsx   # User settings and privacy controls
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx    # Material-UI theme provider
│   │   ├── pages/
│   │   │   ├── __tests__/
│   │   │   │   └── LoginPage.test.tsx  # Jest test suite for login
│   │   │   ├── Archive.tsx         # Archived tasks management
│   │   │   ├── Dashboard.tsx       # Main task management interface
│   │   │   ├── LoginPage.tsx       # User authentication page
│   │   │   └── SignupPage.tsx      # User registration page
│   │   ├── types/
│   │   │   └── task.ts             # TypeScript type definitions
│   │   ├── utils/
│   │   │   ├── __tests__/
│   │   │   │   ├── basic.test.ts   # Basic utility function tests
│   │   │   │   └── timeOptions.test.ts  # Time utility tests
│   │   │   ├── taskUtils.ts        # Task-related utility functions
│   │   │   └── timeOptions.ts      # Time picker options and utilities
│   │   ├── App.tsx                 # React router and protected routes
│   │   ├── index.css               # Global styles
│   │   ├── index.tsx               # React app initialization
│   │   ├── react-beautiful-dnd.d.ts # Type declarations for drag & drop
│   │   ├── setupTests.ts           # Jest test configuration
│   │   └── types.ts                # Additional TypeScript definitions
│   ├── docker-compose.yml          # Frontend containerization
│   ├── Dockerfile                  # Frontend Docker configuration
│   ├── package.json                # Frontend dependencies
│   └── tsconfig.json               # TypeScript configuration
│
├── docker-compose.yml              # Root orchestration for full stack
├── .dockerignore                   # Docker ignore patterns
├── .nvmrc                          # Node.js version specification
└── README.md                       # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Docker**: Containerization

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Material-UI (MUI)**: Component library
- **React Router**: Client-side routing
- **React Beautiful DnD**: Drag and drop functionality
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18.x (if running locally)
- MongoDB instance

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ACCIONLABSPROJECT
   ```

2. **Create environment files:**
   
   Backend `.env`:
   ```env
   PORT=5050
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

   Backend `.env.test`:
   ```env
   MONGO_URI=mongodb://localhost:27017/taskmanager_test
   JWT_SECRET=test_jwt_secret
   NODE_ENV=test
   ```

### 🐳 Docker Deployment (Recommended)

1. **Start the full application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5050

### 💻 Local Development

1. **Backend setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend setup (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage      # Run with coverage report
npm run test:ci           # CI/CD friendly test run
```

### Backend Testing
```bash
cd backend
npm test                   # Run backend tests
```

### Test Coverage
- **Frontend**: Jest with React Testing Library
- **Components**: LoginPage, utility functions, time options
- **Backend**: Route testing, database operations

## 🔐 Authentication & Security

- **JWT Token Authentication**: Secure user sessions
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Frontend route guards
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Server-side data validation

## 👥 Collaboration Features

### Privacy Settings
- **Public Profile**: User appears in collaborator dropdowns, can be added to tasks
- **Private Profile**: User hidden from collaboration, cannot be added to tasks

### Task Collaboration
- **Task Sharing**: Add collaborators via email selection
- **Shared Permissions**: All collaborators can view, edit, and delete tasks
- **Cross-user Visibility**: Tasks appear in all participants' dashboards
- **Archive Synchronization**: Deleted tasks appear in all collaborators' archives

## 📊 Task Management

### Task Properties
- **Title & Description**: Basic task information
- **Date & Time**: Scheduling with start/end times
- **Priority Levels**: High, Medium, Low priority settings
- **Categories**: Work, School, Personal sections
- **Recurring Patterns**: Daily, Weekly, Monthly, Yearly, Weekdays
- **Collaborators**: Multi-user task sharing
- **Status Tracking**: Pending, In Progress, Complete, Deleted

### Status Logic
- **Time-based Status**: Automatic status updates based on current time
- **No End Time**: Tasks marked complete immediately after start time
- **With End Time**: Full Pending → In Progress → Complete cycle
- **Manual Override**: Archive and restore functionality

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication

### Tasks
- `GET /api/tasks` - Get user's tasks (including collaborative)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task (owner or collaborator)
- `DELETE /api/tasks/:id` - Archive task (soft delete)
- `GET /api/tasks/archive` - Get archived tasks
- `PATCH /api/tasks/restore/:id` - Restore archived task
- `DELETE /api/tasks/permanent/:id` - Permanently delete task

### Users
- `GET /api/users` - Get public users (for collaboration)
- `GET /api/users/all` - Get all users (for avatar display)
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/privacy` - Update privacy settings

## 🚀 Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure MongoDB with proper indexing
- Set up SSL/TLS certificates
- Configure proper CORS origins
- Set up logging and monitoring

### Scaling Options
- MongoDB clustering for high availability
- Redis for session management
- Load balancing for multiple instances
- CDN for static asset delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request