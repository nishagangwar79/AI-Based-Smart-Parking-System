# AI-Based Smart Parking System

A modern smart parking platform designed for urban parking management in Delhi NCR and similar cities. The system helps users discover nearby parking lots, view live availability, book parking slots, and receive AI-driven recommendations and demand predictions. It also includes a dedicated admin portal for monitoring bookings, users, and parking operations.

## Project Overview

This project combines:
- A React frontend for user interaction and dashboard management
- An Express.js backend with REST APIs
- MongoDB database models for users, lots, slots, bookings, and history
- JWT-based authentication and role-based access control
- AI-powered recommendations using Google Gemini
- Admin analytics for full system visibility

The goal is to reduce parking-related stress by making parking discovery faster, bookings smarter, and availability more transparent.

## What the Project Does

### User Features
- Search and browse parking lots by location and name
- View lot details, pricing, operating hours, and slot status
- Book parking slots for a selected time range
- Track personal bookings and cancellations
- View AI-generated parking recommendations based on user preferences
- Chat with an AI parking assistant for quick guidance
- Manage profile and vehicle information

### Admin Features
- View dashboard metrics such as revenue, bookings, active slots, and user count
- Review all system bookings
- Review registered users
- Monitor slot status and system activity

### AI Features
- Predict parking demand using recent booking trends
- Recommend the best parking lot based on location, availability, and price
- Offer a conversational AI assistant for common parking questions
- Provide guidance on EV parking, pricing, and best times to park

## Architecture and Structure

```text
AI-Based-Smart-Parking-System/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── parkingLotController.js
│   │   ├── parkingSlotController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── ParkingHistory.js
│   │   ├── ParkingLot.js
│   │   ├── ParkingSlot.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── parkingLotRoutes.js
│   │   ├── parkingSlotRoutes.js
│   │   └── userRoutes.js
│   ├── seed/
│   │   └── seedData.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── parkingPredictionService.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .gitignore
├── README.md
└── package.json (if present in root)
```

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- Lucide React icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- CORS
- Dotenv
- Nodemon

### AI and Intelligence
- Google Gemini API
- Smart demand prediction logic
- Booking trend analysis

### Tools and Utilities
- bcryptjs for password hashing
- MongoDB Atlas or local MongoDB support
- Environment variable security via `.env`

## Functional Workflow

1. User registers or logs in.
2. User searches for parking lots by city or area.
3. User selects a lot and views key details, slots, and price.
4. User books a slot by choosing date and time.
5. Backend validates slot availability and prevents booking conflicts.
6. User can view bookings and cancel them if needed.
7. AI system suggests best parking lots and answers parking questions.
8. Admin reviews usage, users, bookings, and operational KPIs.

## Environment Variables

### Backend
Create a `.env` file inside the `backend` folder using the example file:

```bash
cd backend
copy .env.example .env
```

Example:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-parking
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend
Create a `.env` file inside the `frontend` folder:

```bash
cd frontend
copy .env.example .env
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

> Important: Never commit `.env` files or secret keys to GitHub.

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/nishagangwar79/AI-Based-Smart-Parking-System.git
cd AI-Based-Smart-Parking-System
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure the backend environment

```bash
copy .env.example .env
```

Then update the values in `.env` with your MongoDB connection string, JWT secret, and Gemini API key.

### 4. Start the backend server

```bash
npm run dev
```

The backend runs on:
- http://localhost:5000

### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 6. Configure frontend environment

```bash
copy .env.example .env
```

Then make sure `VITE_API_URL` points to your backend URL.

### 7. Start the frontend application

```bash
npm run dev
```

The frontend runs on:
- http://localhost:5173

## Database Seed Data

The project includes a seed script to populate demo users, parking lots, slots, and bookings.

Run:

```bash
cd backend
npm run seed
```

This creates sample admin and user accounts. Example credentials:

```text
Admin:
- Email: admin@smartparking.com
- Password: admin123

User:
- Email: rahul@example.com
- Password: user123
```

## Production Build Check

To verify the frontend builds successfully:

```bash
cd frontend
npm run build
```

## Project Features Summary

- Smart parking discovery
- Slot booking with conflict prevention
- Personalized AI recommendations
- AI assistant for real-time parking guidance
- Demand forecasting and best-time suggestions
- Role-based admin access
- Secure user authentication
- Booking and parking history tracking

## Security Notes

- JWT tokens are used for protected routes
- Passwords are hashed using `bcryptjs`
- Database credentials and API keys are stored in `.env` files only
- `.env` files are excluded from version control in `.gitignore`

## Contribution

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

This project is currently distributed under the project’s existing license setup unless otherwise specified.

## Contact / Repository

Repository: https://github.com/nishagangwar79/AI-Based-Smart-Parking-System

This project is ideal for demonstration, college projects, and real-world smart city parking solutions.
