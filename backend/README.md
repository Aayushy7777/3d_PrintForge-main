# Node.js/Express.js Backend

A complete production-ready backend that integrates cleanly with the frontend application.

## Tech Stack
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL Database
- **Mongoose**: Object Data Modeling (ODM) library
- **JWT (JSON Web Tokens)**: Authentication
- **bcrypt**: Password hashing
- **multer**: File uploads handling (included in dependencies)

## Project Structure
```text
backend/
├── config/
│   └── db.js            # MongoDB connection
├── controllers/
│   ├── authController.js # Registration, login, profile logic
│   └── userController.js # Users CRUD logic
├── middleware/
│   ├── authMiddleware.js # Route protection using JWT
│   └── errorMiddleware.js# Custom error handlers
├── models/
│   └── User.js          # Mongoose Schema
├── routes/
│   ├── authRoutes.js    # Auth endpoints
│   └── userRoutes.js    # User endpoints
├── utils/
│   └── generateToken.js # JWT generation utility
├── .env.example         # Environment variables template
├── package.json         # Project metadata and dependencies
├── server.js            # Entry point for Express application
└── README.md            # Project documentation
```

## How to Run

1. **Install Dependencies**
   Open your terminal in the `backend` folder and run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` or create a new `.env` file in the `backend` root. Update the fields accordingly:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/your_db_name
   JWT_SECRET=your_super_secret_key
   NODE_ENV=development
   ```
   > Note: Ensure you have MongoDB running locally or replace `MONGO_URI` with a MongoDB Atlas URI.

3. **Start the Server**
   - For regular execution:
     ```bash
     npm start
     ```
   - For development (with auto-reload via `nodemon`):
     ```bash
     npm run dev
     ```

## API Endpoints & Example Responses

### Auth Routes (`/api/auth`)

#### 1. Register User
- **Method**: POST `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### 2. Login User
- **Method**: POST `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: (Same as Register, returns a valid token).

#### 3. Get User Profile (Protected)
- **Method**: GET `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### User Routes (`/api/users` - Protected)

#### 1. Get All Users
- **Method**: GET `/api/users`
- **Headers**: `Authorization: Bearer <token>`

#### 2. Get User By ID
- **Method**: GET `/api/users/:id`

#### 3. Update User
- **Method**: PUT `/api/users/:id`
- **Body**:
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```

#### 4. Delete User
- **Method**: DELETE `/api/users/:id`
- **Response**:
  ```json
  {
    "message": "User removed"
  }
  ```
