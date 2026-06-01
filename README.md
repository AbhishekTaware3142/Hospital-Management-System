# 🏥 MediBook — Hospital Management System

A full-stack hospital management web app built with React + Node.js + MongoDB. Patients can book appointments with doctors, admins can manage the entire system, and all roles get a tailored dashboard experience.

---

## ✨ Features

### Patient
- Register & login with phone number
- Browse doctors and book appointments
- View appointment history with status tracking
- Cancel appointments

### Doctor
- Login and view scheduled appointments
- Manage appointment status

### Admin (Master)
- Full dashboard with live analytics
- View all appointments across the system
- Filter by status with pagination

### General
- JWT-based authentication
- Role-based access control (Patient / Doctor / Master)
- Responsive UI with dark mode support (Chakra UI)
- Static hospital info — no extra DB dependency

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Chakra UI, Framer Motion, Axios |
| Backend   | Node.js, Express.js                             |
| Database  | MongoDB, Mongoose                               |
| Auth      | JWT (jsonwebtoken)                              |

---

## 📁 Project Structure

```
MediBook/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register / Login
│   │   ├── appointmentController.js # Book / Cancel / Review
│   │   ├── userController.js        # User profile
│   │   ├── hospitalController.js    # Hospital routes
│   │   ├── paymentController.js     # Payments
│   │   └── analyticsController.js  # Dashboard stats
│   ├── middleware/
│   │   └── auth.js                  # JWT protect + authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Hospital.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   ├── users.js
│   │   ├── hospitals.js
│   │   ├── payments.js
│   │   └── analytics.js
│   ├── utils/
│   │   └── roles.js                 # Role constants
│   ├── seed.js                      # DB seed script
│   ├── playground.mongodb           # VS Code MongoDB playground
│   ├── server.js                    # Express entry point
│   └── .env                         # Environment variables
│
└── frontend/
    └── src/
        ├── api/
        │   ├── axiosConfig.js       # Axios instance + interceptors
        │   ├── appointmentService.js
        │   ├── analyticsService.js
        │   └── userService.js
        ├── components/
        │   ├── AppointmentsList.jsx
        │   ├── BookAppointment.jsx
        │   ├── BookingModal.jsx
        │   ├── HospitalCard.jsx
        │   ├── StatCard.jsx
        │   └── UserProfile.jsx
        ├── constants/
        │   └── hospitalData.js      # Static hospital / dept / doctor data
        ├── hooks/
        │   ├── useHospital.js       # Returns static hospital data
        │   ├── useAppointments.js
        │   ├── useDoctors.js
        │   └── useAnalytics.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── HospitalsPage.jsx
        │   ├── BookPage.jsx
        │   ├── PaymentsPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── ReportsPage.jsx
        │   ├── AdminPage.jsx
        │   └── SettingsPage.jsx
        ├── router/
        │   └── AppRouter.jsx
        ├── utils/
        │   └── roles.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/AbhishekTaware3142/Hospital-Management-System.git
cd Hospital-Management-System
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/Medibook
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

### 3. Seed the database

Open `backend/playground.mongodb` in VS Code with the MongoDB extension and click **Run All** — this inserts all users, doctors, appointments, and payments.

Or run the seed script:

```bash
node seed.js
```

### 4. Start the backend

```bash
npm run dev
# Server runs at http://localhost:5000
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 🔑 Test Credentials

| Role         | Phone        | Password   | Name              |
|--------------|--------------|------------|-------------------|
| Master Admin | 9000000001   | Admin123   | Admin User        |
| Patient      | 9999900001   | Patient123 | Ritu Sharma       |
| Patient      | 9999900002   | Patient123 | Amit Joshi        |
| Patient      | 9999900003   | Patient123 | Sana Patel        |
| Doctor       | 8888800001   | Doctor123  | Dr. Rajeev Sharma |
| Doctor       | 8888800002   | Doctor123  | Dr. Neha Verma    |
| Doctor       | 8888800003   | Doctor123  | Dr. Amit Patel    |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Description        | Auth |
|--------|------------------|--------------------|------|
| POST   | `/auth/register` | Register new user  | No   |
| POST   | `/auth/login`    | Login              | No   |
| GET    | `/auth/me`       | Get current user   | Yes  |

### Appointments

| Method | Endpoint                          | Description              | Auth |
|--------|-----------------------------------|--------------------------|------|
| POST   | `/appointments`                   | Book appointment         | Yes  |
| GET    | `/appointments`                   | Get appointments (paged) | Yes  |
| GET    | `/appointments/:id`               | Get single appointment   | Yes  |
| PUT    | `/appointments/:id/cancel`        | Cancel appointment       | Yes  |
| POST   | `/appointments/:id/review`        | Add review & rating      | Yes  |

### Users

| Method | Endpoint       | Description      | Auth |
|--------|----------------|------------------|------|
| GET    | `/users`       | List all users   | Yes  |
| GET    | `/users/:id`   | Get user by ID   | Yes  |

### Analytics

| Method | Endpoint           | Description        | Auth  |
|--------|--------------------|--------------------|-------|
| GET    | `/analytics/reports` | Dashboard stats  | Admin |

### Payments

| Method | Endpoint         | Description       | Auth |
|--------|------------------|-------------------|------|
| GET    | `/payments`      | List payments     | Yes  |
| GET    | `/payments/:id`  | Get payment by ID | Yes  |

---

## 💾 Database Schema

### User
```js
{
  name, phone, password, role,        // role: 'patient' | 'Docter' | 'Master'
  address, isVerified, isActive,
  // Doctor fields:
  specialization, licenseNumber,
  experience, consultationFee,
  availableSlots: [{ day, startTime, endTime }]
}
```

### Appointment
```js
{
  patient: ObjectId,  doctor: ObjectId,
  appointmentDate, timeSlot,
  status,        // 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  reason, symptoms, prescription,
  fee, paymentStatus,
  rating, review, cancellationReason
}
```

### Payment
```js
{
  appointment: ObjectId, patient: ObjectId, doctor: ObjectId,
  amount, status,   // 'pending' | 'completed' | 'refunded' | 'failed'
  method, gateway, transactionId,
  paidAt, refundedAt
}
```

---

## 🔒 Security Notes

- Passwords are stored as **plain text** in the current dev build — add bcrypt hashing before any production use
- JWT tokens expire in 30 days
- Change `JWT_SECRET` to a strong random value in production
- Add CORS origin restrictions in production (`cors({ origin: 'https://yourdomain.com' })`)

---

## 📄 License

MIT — free to use and modify.
