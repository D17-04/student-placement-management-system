# Student Placement Management System

A complete role-based placement portal built with HTML, CSS, JavaScript, Node.js, Express.js and MongoDB.

## Features

- Admin, student and company authentication
- Password hashing and JWT authorization
- Student profiles and PDF/DOC/DOCX resume uploads
- Company management and company profiles
- Job posting, searching and filtering
- Student applications and status tracking
- Placement records and admin dashboard statistics
- Responsive frontend for desktop and mobile

## Project Structure

```text
backend/
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  uploads/
  server.js
frontend/
  index.html
  assets/css/style.css
  assets/js/app.js
test/
render.yaml
.env.example
```

## 1. Prerequisites

Install Node.js 18 or newer and MongoDB. MongoDB can run locally or through MongoDB Atlas.

## 2. Install

```bash
npm install
```

Copy the environment example:

```bash
copy .env.example .env
```

Windows PowerShell also supports:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set `MONGODB_URI` and `JWT_SECRET`.

For local MongoDB:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/placement_management
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@placement.edu
ADMIN_PASSWORD=Admin@123
```

## 3. Run Locally

```bash
npm run dev
```

Open `http://localhost:5000`.

For production mode:

```bash
npm start
```

The server seeds this administrator if it does not already exist:

- Email: `admin@placement.edu`
- Password: `Admin@123`

Change these demo credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, or remove the seeded account after setup.

## 4. Main API Routes

- `POST /api/auth/register/student`
- `POST /api/auth/register/company`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `/api/students`
- `/api/companies`
- `/api/jobs`
- `/api/applications`
- `/api/placements`
- `GET /api/dashboard`

Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

## 5. Test

```bash
npm test
```

## 6. Deploy to Render

1. Push this folder to GitHub.
2. In Render, choose **New > Web Service**.
3. Connect the GitHub repository.
4. Render reads `render.yaml`, or use:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
5. Add these environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: a strong random secret
   - `JWT_EXPIRES_IN`: `7d`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`
6. Deploy and open the generated Render URL.

MongoDB Atlas must allow connections from the Render service. Add the Atlas network access rule required by the deployed environment.
