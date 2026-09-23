Prescripto

Prescripto is a full-stack doctor appointment booking platform built with the MERN stack. It provides separate interfaces for patients, doctors, and administrators.

The project is divided into three applications:

frontend/ — patient-facing React application

admin/ — admin and doctor dashboard

backend/ — Express.js REST API with MongoDB

✨ Features

Patient Features

User registration and login

JWT-based authentication

Browse all doctors

Filter doctors by speciality

View doctor profiles and availability

Generate available appointment slots

Book appointments

View personal appointments

Cancel appointments

Update profile information

Upload profile images to Cloudinary

Online payment flow

Payment status tracking

Responsive UI with Tailwind CSS

Toast notifications for user actions

Doctor Features

Doctor login

Doctor dashboard

View appointments

View/update doctor profile

Change appointment status

Complete appointments

Cancel appointments

View earnings, appointment count, and patient count

Manage availability

Admin Features

Admin login

Admin dashboard

View doctors

Add new doctors

Upload doctor images

Change doctor availability

View all appointments

Cancel appointments

View dashboard statistics such as doctors, patients, and appointments

🏗️ Architecture

                    ┌──────────────────────┐
                    │      Patient UI      │
                    │ React + Vite +       │
                    │ Tailwind CSS         │
                    └──────────┬───────────┘
                               │
                               │ REST API / Axios
                               ▼
                    ┌──────────────────────┐
                    │     Express API      │
                    │ Node.js + JWT        │
                    └───────┬───────┬──────┘
                            │       │
                   ┌────────┘       └─────────┐
                   ▼                          ▼
          ┌─────────────────┐       ┌─────────────────┐
          │    MongoDB      │       │   Cloudinary    │
          │ Users/Doctors/  │       │ Profile &       │
          │ Appointments    │       │ Doctor Images   │
          └─────────────────┘       └─────────────────┘

                    ▲
                    │
              REST API / Axios
                    │
          ┌─────────┴─────────┐
          │ Admin / Doctor UI │
          │ React + Vite      │
          └───────────────────┘

🛠️ Tech Stack

Frontend

React 19

Vite

React Router

Tailwind CSS

Axios

React Toastify

Admin / Doctor Dashboard

React 19

Vite

React Router

Tailwind CSS

Axios

React Toastify

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT (jsonwebtoken)

bcrypt

Multer

Cloudinary

CORS

Validator

Razorpay package is included in the backend dependencies

📁 Project Structure

prescripto-main/
│
├── frontend/                    # Patient application
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── Appointment.jsx
│       │   ├── Contact.jsx
│       │   ├── Doctors.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── MyAppointments.jsx
│       │   ├── MyProfile.jsx
│       │   └── Payment.jsx
│       ├── App.jsx
│       └── main.jsx
│
├── admin/                       # Admin + Doctor dashboard
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── Admin/
│       │   │   ├── AddDoctor.jsx
│       │   │   ├── AllAppointments.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   └── DoctorsList.jsx
│       │   ├── Doctor/
│       │   │   ├── DoctorAppointments.jsx
│       │   │   ├── DoctorDashboard.jsx
│       │   │   └── DoctorProfile.jsx
│       │   └── Login.jsx
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── mongodb.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── doctorController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authAdmin.js
│   │   ├── authDoctor.js
│   │   ├── authUser.js
│   │   └── multer.js
│   ├── models/
│   │   ├── appointmentModel.js
│   │   ├── doctorModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── adminRoute.js
│   │   ├── doctorRoute.js
│   │   └── userRoute.js
│   ├── server.js
│   └── package.json
│
├── SECURITY.md
└── README.md

⚙️ Prerequisites

Install:

Node.js

npm

MongoDB database (local or MongoDB Atlas)

Cloudinary account

The admin application currently uses Vite 7, whose installed package requires Node.js 20.19+ or 22.12+. Using a current Node.js LTS release is recommended.

🚀 Installation

1. Clone the repository

git clone <your-repository-url>
cd prescripto-main

2. Install backend dependencies

cd backend
npm install

3. Install frontend dependencies

Open another terminal:

cd frontend
npm install

4. Install admin dependencies

Open another terminal:

cd admin
npm install

🔐 Environment Variables

Create a .env file inside the backend/ folder:

PORT=4000

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>

JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

Create a .env file inside both frontend/ and admin/:

VITE_BACKEND_URL=http://localhost:4000

Important

Do not commit .env files or secret credentials to GitHub.

▶️ Run the Project

The project contains three separate applications, so run them in separate terminals.

Terminal 1 — Backend

cd backend
npm run server

The backend starts on:

http://localhost:4000

A basic health-check endpoint is available at:

GET /

Expected response:

API WORKING

Terminal 2 — Patient Frontend

cd frontend
npm run dev

Vite will display the local development URL in the terminal.

Terminal 3 — Admin / Doctor Dashboard

cd admin
npm run dev

Vite will display the local development URL in the terminal.

🔑 Authentication

Prescripto uses JWT-based authentication for three roles:

User Authentication

The patient token is stored on the client and sent to protected APIs using the token header.

Example:

headers: {
  token: "<JWT>"
}

Doctor Authentication

Doctor-protected APIs use:

headers: {
  dToken: "<JWT>"
}

Admin Authentication

Admin-protected APIs use:

headers: {
  atoken: "<JWT>"
}

Backend middleware validates each role before allowing access to protected routes.

📌 API Endpoints

User APIs

Method

Endpoint

Purpose

Auth

POST

/api/user/register

Register a patient

No

POST

/api/user/login

Login patient

No

GET

/api/user/get-profile

Get patient profile

User

POST

/api/user/update-profile

Update profile / upload image

User

POST

/api/user/book-appointment

Book appointment

User

POST

/api/user/appointments

Get patient appointments

User

POST

/api/user/cancel-appointment

Cancel appointment

User

POST

/api/user/pay/getAmount

Get appointment amount

User

POST

/api/user/pay/success

Mark payment successful

User

Doctor APIs

Method

Endpoint

Purpose

Auth

GET

/api/doctor/list

List doctors

No

POST

/api/doctor/login

Doctor login

No

POST

/api/doctor/appointments

Get doctor's appointments

Doctor

POST

/api/doctor/complete-appointment

Complete appointment

Doctor

POST

/api/doctor/cancel-appointment

Cancel appointment

Doctor

POST

/api/doctor/dashboard

Doctor dashboard data

Doctor

POST

/api/doctor/profile

Get doctor profile

Doctor

POST

/api/doctor/update-profile

Update doctor profile

Doctor

Admin APIs

Method

Endpoint

Purpose

Auth

POST

/api/admin/login

Admin login

No

POST

/api/admin/add-doctor

Add doctor + image upload

Admin

POST

/api/admin/all-doctors

Get all doctors

Admin

POST

/api/admin/change-availability

Toggle doctor availability

Admin

POST

/api/admin/appointments

Get all appointments

Admin

POST

/api/admin/cancel-appointment

Cancel appointment

Admin

GET

/api/admin/dashboard

Admin dashboard statistics

Admin

🗄️ Database Models

User

The user model stores patient information such as:

Name

Email

Password

Profile image

Phone

Address

Date of birth

Gender

Passwords are hashed using bcrypt.

Doctor

The doctor model contains:

Name

Email

Hashed password

Profile image

Speciality

Degree

Experience

About

Availability

Consultation fees

Address

Booked appointment slots

Appointment

The appointment model contains:

userId

docId

slotDate

slotTime

Patient data

Doctor data

Appointment amount

Cancellation status

Payment status

Completion status

Example appointment lifecycle:

Available
   │
   ▼
Booked
   │
   ├──► Cancelled
   │
   ├──► Payment Completed
   │
   └──► Appointment Completed

📅 Appointment Booking Flow

Patient
   │
   ▼
Select Doctor
   │
   ▼
Select Date
   │
   ▼
Select Time Slot
   │
   ▼
POST /api/user/book-appointment
   │
   ▼
Backend checks doctor availability
   │
   ▼
Appointment saved in MongoDB
   │
   ▼
Patient sees appointment in My Appointments
   │
   ▼
Payment
   │
   ├── Success
   │
   └── Failure / Cancellation

The frontend currently generates appointment slots in 30-minute intervals between 10:00 AM and 9:00 PM and removes slots already stored as booked for that doctor/date.

☁️ Image Upload

The project uses:

Multer for receiving multipart file uploads

Cloudinary for cloud image storage

Images are used for:

Patient profile pictures

Doctor profile pictures

The backend uploads files to Cloudinary and stores the resulting secure image URL in MongoDB.

💳 Payment

The current frontend contains a dummy payment gateway for demonstration.

The payment page provides:

Payment amount retrieval

Simulated payment success

Simulated payment failure

Payment status update in the appointment record

The backend currently returns a dummy transaction ID:

dummyTrasnsaction1234

Although the backend package list includes razorpay, the current payment flow in this version does not perform a real Razorpay transaction.

For production, replace the simulated flow with a verified payment-provider integration and server-side signature/webhook validation.

🔒 Security

The project already includes several security-related practices:

Password hashing with bcrypt

JWT authentication

Role-specific authentication middleware

Email validation

Password-length validation

Protected routes for users, doctors, and admins

Cloudinary-based image handling

Production hardening to consider

Before deploying publicly, consider:

Add JWT expiration and refresh-token handling

Restrict CORS to trusted frontend origins

Add rate limiting to authentication endpoints

Validate and sanitize all user-controlled input

Add stronger authorization checks around appointment/payment operations

Use atomic updates or MongoDB transactions for high-concurrency slot booking

Add proper production payment verification/webhooks

Avoid exposing sensitive configuration through source code

Improve error handling and logging

Add API tests and integration tests

🧪 Available Commands

Frontend

npm run dev
npm run build
npm run lint
npm run preview

Admin

npm run dev
npm run build
npm run lint
npm run preview

Backend

npm run server
npm start

📈 Possible Future Improvements

Real Razorpay/Stripe payment integration

Email/SMS appointment reminders

Doctor search by name, fee, experience, and availability

Pagination for doctors and appointments

MongoDB indexes for frequently queried fields

Redis caching for doctor listings and sessions

Atomic slot reservation / transaction-based booking

Refresh-token rotation

Password reset via email

Doctor reviews and ratings

Prescription management

Video consultation

Appointment reminder notifications

Automated API and frontend tests

🎯 Project Highlights

Prescripto demonstrates practical full-stack development concepts:

MERN stack architecture

REST API design

Authentication and authorization

Role-based access control

MongoDB data modeling

File uploads

Cloud image storage

Appointment and slot management

React Context API state management

Protected application flows

Admin and doctor dashboards

Responsive UI development
