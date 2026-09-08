# AI-Based Smart Parking System

A MERN application for parking discovery, slot booking, user management, administration, and AI-powered parking recommendations.

## Project Structure

- `backend/` - Express, MongoDB, authentication, booking, and AI API
- `frontend/` - React and Vite web application

## Local Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set the values in `backend/.env` before starting the server.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend expects the backend API URL in `VITE_API_URL`.

## Production Checks

```bash
cd frontend
npm run build
```

Never commit `.env` files, API keys, database credentials, `node_modules`, or build output.