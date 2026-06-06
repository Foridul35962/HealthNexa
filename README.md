<div align="center">

<br/>

```
██╗  ██╗███████╗ █████╗ ██╗  ████████╗██╗  ██╗███╗   ██╗███████╗██╗  ██╗ █████╗
██║  ██║██╔════╝██╔══██╗██║  ╚══██╔══╝██║  ██║████╗  ██║██╔════╝╚██╗██╔╝██╔══██╗
███████║█████╗  ███████║██║     ██║   ███████║██╔██╗ ██║█████╗   ╚███╔╝ ███████║
██╔══██║██╔══╝  ██╔══██║██║     ██║   ██╔══██║██║╚██╗██║██╔══╝   ██╔██╗ ██╔══██║
██║  ██║███████╗██║  ██║███████╗██║   ██║  ██║██║ ╚████║███████╗██╔╝ ██╗██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### AI-Powered Healthcare Management Ecosystem

*A full-stack platform connecting Patients, Doctors, Hospitals, Receptionists, and Pharmacies*  
*through real-time queue management, smart appointment scheduling, and AI-driven symptom analysis.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./LICENCE)

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-system-architecture) · [Installation](#-installation) · [API Docs](#-api-modules) · [Roles](#-user-roles)

<br/>

</div>

---

## 📖 Overview

**HealthNexa** digitises the complete patient journey — from AI-powered symptom analysis and geo-based hospital/pharmacy discovery, through slot-based appointment booking, QR code check-in, and live queue tracking.

Six distinct user roles — each with their own isolated dashboard and API surface — make HealthNexa a complete ecosystem for patients, hospitals, and pharmacies alike.

---

## ✨ Features

### 👤 Patient Portal
- Secure authentication and profile management with image upload
- Book appointments with available doctors via smart slot scheduling
- View upcoming and historical appointments with unique QR code per booking
- **AI-powered symptom checker** (Google Gemini) with full history tracking
- Find nearest hospitals and pharmacies on an interactive map
- Real-time live queue token tracking

### 👨‍⚕️ Doctor Portal
- Live queue dashboard — see today's patient list in real time
- **Call next patient** with one click — broadcasts instantly via Socket.IO
- Mark appointments as complete
- View patient and appointment details

### 🏥 Hospital Administration
- Hospital profile and image management
- Add, edit, and remove doctors (with Cloudinary image upload)
- Add and manage receptionists
- Operational dashboard with key stats

### 🧑‍💼 Receptionist Portal
- **QR code scanner** — scan patient's appointment QR to instantly check in
- Insert checked-in patient into the priority queue
- Recall skipped patients
- Real-time queue workflow support

### 💊 Pharmacy Portal
- Pharmacy profile and image management
- Medicine inventory management (add, edit, delete, stock, price)
- Submit new medicine listing requests to admin
- Pharmacy dashboard overview

### 🤖 AI Integration
- **Google Gemini AI** symptom analysis — possible conditions, emergency level, recommended departments, red flags, home-care advice
- Results **cached in Redis** by SHA-256 request hash — zero repeat API cost
- Full symptom history stored per patient

### ⚡ Real-Time Features
- **Socket.IO** room-based live queue updates (`queue:{doctorId}:{date}`)
- Live token tracking — patients, receptionists, and doctors all see the same state
- No polling — all updates pushed via WebSocket broadcast

### 🔐 Security & Access Control
- JWT stored in **HTTP-only cookies** (XSS-safe)
- **6 role-based middleware guards** — strict API isolation per role
- Redis-backed session verification (5-min TTL)
- Secure bcrypt password hashing
- OTP email verification via **Brevo** for registration and password reset
- Admin approval workflow — hospitals, pharmacies, and medicines require review before going live

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 16.2 (App Router) | Framework, SSR/SSG |
| React 19 + TypeScript 5 | UI + type safety |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | Global state management (per-role slices) |
| React Hook Form | Form handling & validation |
| Framer Motion | Animations & transitions |
| Socket.IO Client | Real-time queue updates |
| Leaflet / React-Leaflet | Interactive geo maps |
| Axios | HTTP client |
| @yudiel/react-qr-scanner | QR code scanning (receptionist) |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js (ESM) + Express 5 | REST API server |
| Socket.IO 4 | Real-time WebSocket server |
| Mongoose 9 | MongoDB ODM |
| bcryptjs + jsonwebtoken | Auth — hashing + JWT |
| express-validator | Input validation & sanitisation |
| multer | File upload handling |
| qrcode | Appointment QR generation |

### Database & Caching

| Technology | Purpose |
|---|---|
| MongoDB 7 | Primary data store with 2dsphere geo-indexes |
| Redis 7 (ioredis) | Session cache + AI result cache |
| RedisInsight | Redis GUI (included in Docker) |

### Cloud & AI

| Service | Purpose |
|---|---|
| Google Gemini (`@google/generative-ai`) | AI symptom analysis |
| Cloudinary v2 | Image storage & CDN |
| Brevo SMTP API | Transactional OTP emails |

### DevOps

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Containerised full-stack deployment |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│           Next.js 16 (App Router) — port 3000                │
│    Redux Toolkit · React Hook Form · Socket.IO Client        │
│           Leaflet Maps · QR Scanner · Framer Motion          │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                         API LAYER                            │
│            Express 5 + Socket.IO — port 5000                 │
│     protect → role guards → controllers → helpers            │
└──────┬──────────────────────────────┬────────────────────────┘
       │                              │
┌──────▼──────┐              ┌────────▼────────┐
│  MongoDB 7  │              │    Redis 7       │
│  Mongoose   │              │  Session cache   │
│  2dsphere   │              │  AI result cache │
│  geo-index  │              │  5-min TTL       │
└─────────────┘              └─────────────────┘

External Services:
  ├── Cloudinary     →  image storage & CDN
  ├── Brevo          →  OTP transactional email
  └── Google Gemini  →  AI symptom analysis
```

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| 🛡️ **Admin** | Approve/reject hospital, pharmacy & medicine requests; platform dashboard |
| 👤 **Patient** | Book appointments, AI symptom checker, live queue tracking, pharmacy discovery |
| 👨‍⚕️ **Doctor** | View today's queue, call next patient, mark appointments complete |
| 🧑‍💼 **Receptionist** | QR check-in, insert patient into queue, recall skipped patients |
| 🏥 **Hospital Admin** | Manage doctors and receptionists, hospital profile |
| 💊 **Pharmacy Owner** | Manage medicine inventory, submit listing requests, pharmacy profile |

---

## 📂 Project Structure

```
HealthNexa/
│
├── 📁 client/                        # Next.js 16 frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/               # Login, Register, Forget Password
│       │   ├── (patient)/            # Dashboard, Appointments, Symptoms
│       │   ├── admin/                # Registration request management
│       │   ├── hospital-admin/       # Doctor & receptionist management
│       │   ├── doctor/               # Live queue dashboard
│       │   ├── receptionist/         # Check-in & recall
│       │   ├── pharmacy/             # Inventory & profile
│       │   └── emergency/            # Emergency info
│       ├── components/               # Shared UI components
│       ├── store/slice/              # Redux slices (one per role)
│       ├── providers/                # Context providers (one per role)
│       ├── hooks/                    # useSocket, GetUser
│       └── Types/                    # TypeScript interfaces
│
├── 📁 server/                        # Node.js / Express backend
│   └── src/
│       ├── controller/               # Business logic (one per role)
│       ├── routes/                   # Express routers (one per role)
│       ├── models/                   # Mongoose schemas
│       ├── middlewares/              # protect, 6x role guards, upload
│       ├── config/                   # DB, Redis, Cloudinary, Gemini, Socket
│       └── helpers/                  # ApiErrors, ApiResponse, AsyncHandler
│
├── 🐳 docker-compose.yml
├── 📄 .env.docker
└── 📄 LICENCE
```

---

## 🐳 Docker Support

The entire stack is fully containerised. One command starts everything.

### Included Containers

| Container | Service |
|---|---|
| `client` | Next.js frontend |
| `server` | Express + Socket.IO API |
| `mongo` | MongoDB 7 |
| `redis` | Redis 7 |
| `redisinsight` | Redis GUI |

### Commands

```bash
# Start all services (with build)
docker compose up --build

# Run in background
docker compose up -d --build

# Stop all services
docker compose down
```

### Ports

| Service | Port |
|---|---|
| Frontend | 3000 |
| Backend | 5000 |
| MongoDB | 27018 |
| Redis | 6380 |
| RedisInsight | 5540 |

---

## 🚀 Installation

### Prerequisites
- Node.js >= 18
- Docker + Docker Compose **or** local MongoDB + Redis

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HealthNexa.git
cd HealthNexa
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in all environment variable values
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Environment Variables

Create `server/.env`:

```env
# Server
CORS_ORIGIN=http://localhost:3000

# Authentication
TOKEN_SECRET=your_super_secret_jwt_key
TOKEN_EXPIRY=7d

# Database
MONGODB_URI=mongodb://localhost:27017/healthnexa

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=healthNexa

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo (Email OTP)
SENDER_EMAIL=your_sender@example.com
BREVO_API_KEY=your_brevo_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## ▶️ Running the Project

### Docker (Recommended)

```bash
cp .env.example .env.docker   # fill in values
docker compose up --build
```

### Manual Development

```bash
# Terminal 1 — Backend
cd server && npm start

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## 📡 API Modules

> Base URL: `http://localhost:5000/api`  
> Protected routes require a valid JWT (set as HTTP-only cookie on login).

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/patient-registration` | Register patient + OTP email | Public |
| `POST` | `/verify-regi` | Verify registration OTP | Public |
| `POST` | `/hospital-registration` | Submit hospital registration request | Public |
| `POST` | `/pharmacy-registration` | Submit pharmacy registration request | Public |
| `POST` | `/login` | Login → sets JWT cookie | Public |
| `GET` | `/logout` | Clear JWT cookie | Public |
| `POST` | `/forget-pass` | Send password reset OTP | Public |
| `POST` | `/verify-forget-pass` | Validate reset OTP | Public |
| `PATCH` | `/reset-pass` | Set new password | Public |
| `POST` | `/resend-otp` | Resend OTP | Public |
| `GET` | `/user` | Get authenticated user | 🔒 Protected |

### 🛡️ Admin — `/api/admin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/request-hospital` | List pending hospital requests |
| `POST` | `/add-hospital` | Approve & create hospital |
| `DELETE` | `/request-hospital/:id` | Reject hospital request |
| `GET` | `/request-pharmacy` | List pending pharmacy requests |
| `POST` | `/add-pharmacy` | Approve & create pharmacy |
| `GET` | `/request-medicine` | List pending medicine requests |
| `POST` | `/add-medicine` | Approve & add medicine to catalogue |
| `GET` | `/dashboard` | Platform-wide admin dashboard |

### 👤 Patient — `/api/patient`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/add-appointment` | Book an appointment |
| `GET` | `/upcomming-appointment` | Upcoming appointments |
| `GET` | `/appointment-history` | Full appointment history |
| `GET` | `/appointment/:id` | Single appointment detail |
| `DELETE` | `/appointment/:id` | Cancel appointment |
| `GET` | `/doctor-token/:doctorId/:date` | Current live queue token |
| `GET` | `/all-symptoms` | All AI symptom check results |
| `GET` | `/symptom/:id` | Single symptom check result |
| `DELETE` | `/symptom/:id` | Delete symptom check |
| `PATCH` | `/update-patient` | Update profile + image |

### 🤖 AI — `/api/ai`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/check-symptoms` | Gemini AI symptom analysis (Redis cached) |

**Request Body:**
```json
{
  "age": 28,
  "gender": "male",
  "symptoms": ["headache", "fever", "fatigue"],
  "duration": "3 days",
  "temperature": "38.5°C",
  "bloodPressure": "120/80",
  "conditions": [],
  "medications": [],
  "allergies": [],
  "notes": "Started after getting wet in the rain"
}
```

### 👨‍⚕️ Doctor — `/api/doctor`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Today's queue and stats |
| `GET` | `/call-next` | Advance queue to next patient |
| `PATCH` | `/appointment-complete` | Mark current appointment complete |

### 🧑‍💼 Receptionist — `/api/receptionist`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/checkIn` | QR scan → insert patient into queue |
| `PATCH` | `/recallPatient` | Recall a skipped patient |
| `GET` | `/dashboard` | Receptionist dashboard |

### 🏥 Hospital Admin — `/api/hospital-admin`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/add-doctor` | Add doctor with image upload |
| `PATCH` | `/edit-doctor/:id` | Edit doctor details |
| `DELETE` | `/delete-doctor/:id` | Remove doctor |
| `POST` | `/add-receptionist` | Add receptionist |
| `GET` | `/dashboard` | Hospital admin stats |

### 💊 Pharmacy — `/api/pharmacy`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/req-medicine` | Request new medicine listing |
| `POST` | `/add-medishop` | Add approved medicine to inventory |
| `PATCH` | `/edit-medishop/:id` | Edit medicine in shop |
| `DELETE` | `/pharMedi/:id` | Remove medicine from shop |
| `GET` | `/all-pharMedi` | All medicines in inventory |
| `GET` | `/dashboard` | Pharmacy dashboard |
| `PATCH` | `/edit-pharma` | Edit pharmacy profile + image |

### 🌐 Public — `/api/public`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/nearest-hospital` | Nearest hospitals by coordinates |
| `POST` | `/nearest-pharmacy` | Nearest pharmacies by coordinates |
| `GET` | `/get-doctors/:params` | Search doctors by filters |
| `GET` | `/get-doctor/:id` | Single doctor detail |
| `GET` | `/get-hospital/:id` | Hospital detail |
| `GET` | `/search-medicine` | Search medicines by name |
| `GET` | `/get-medicine/:id` | Single medicine detail |

---

## 🗄️ Database Models

<details>
<summary><strong>Click to expand — all collections</strong></summary>

| Collection | Key Fields |
|---|---|
| `users` | `fullName, email, phone, password (bcrypt), image, role, staffRole, hospitalId, pharmacyId` |
| `doctors` | `userId, hospitalId, department, chamberNumber, consultationFee, slotDuration, schedule[]` |
| `hospitals` | `name, address, contactNumber, specialties[], image, location (GeoJSON Point)` |
| `pharmacies` | `name, address, contactNumber, image, location (GeoJSON Point)` |
| `appointments` | `patientId, doctorId, hospitalId, date, slotStart, slotEnd, status, qrHash, tokenNumber, isSkipped, checkedIn` |
| `queues` | `appointmentId, doctorId, date, tokenNumber, priority, status, checkedInAt, calledAt, completedAt` |
| `medicines` | `name, genericName, brandName, manufacturer, medicineType, strength, category, requiresPrescription, sideEffects[]` |
| `pharmacymedicines` | Junction: `pharmacyId <-> medicineId` with stock & price |
| `symptomcheckers` | `userId, patientInfo, input (symptoms/vitals), aiResult (conditions/emergency/recommendations)` |
| `requesthospitals` | Pending hospital registration requests |
| `requestpharmacies` | Pending pharmacy registration requests |
| `requestmedicines` | Pending medicine listing requests |

**Notable Indexes:**
- `appointments` — unique on `(doctorId, date, slotStart)` — prevents double-booking
- `queues` — unique on `(doctorId, date, tokenNumber)` — sequential tokens guaranteed
- `hospitals`, `pharmacies` — 2dsphere on `location` — enables geo-spatial queries

</details>

---

## 🔐 Authentication & Security

```
Client → POST /api/auth/login
       ← Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Strict

Every protected request:
  protect middleware
    → decode JWT
    → check Redis cache (5-min TTL)
    → fallback to MongoDB lookup
    → attach user to req.user
    → role guard middleware
    → controller
```

- ✅ JWT in HTTP-only cookies — XSS-safe, no JS access
- ✅ 6 role-based middleware guards — strict server-side isolation
- ✅ bcrypt password hashing
- ✅ express-validator input sanitisation
- ✅ OTP email verification via Brevo
- ✅ Admin approval workflow — no unverified entity enters production data
- ✅ Unique QR hash per appointment — cannot be guessed or reused

---

## 📸 Screenshots

| Home | Patient Dashboard | AI Symptom Checker |
|---|---|---|
| ![Home](https://drive.google.com/file/d/11-x61r5Uyf2BMGc4H6J_Y9NTab_-ZKy-/view?usp=sharing) | ![Dashboard](https://drive.google.com/file/d/1e0heXwp5JjpT1UVF7yp5NIaYny_3-R9P/view?usp=sharing) | ![Symptom Checker](https://drive.google.com/file/d/1XsVc3pTzzkTHRqQIP6cG8q9tcas_HYTQ/view?usp=sharing) |

| Doctor Queue | Receptionist Check-In | Admin Panel |
|---|---|---|
| ![Doctor](https://drive.google.com/file/d/1W9T6DoPzRsg45Bans9YppWFAYdsh2nOZ/view?usp=sharing) | ![Receptionist](https://drive.google.com/file/d/1VgJQle_ftJJwvFfQzmCgp35Bk8Ovwrli/view?usp=sharing) | ![Admin](https://drive.google.com/file/d/1kfTEVB-Agjq7gWyeD3vhVlfJLhCWCuUN/view?usp=sharing) |

---

## 🚧 Future Improvements

- [ ] Video consultation (WebRTC / telemedicine)
- [ ] Online payment gateway for consultation fees
- [ ] E-prescriptions and digital medical records
- [ ] Push notifications for appointment reminders
- [ ] React Native mobile application
- [ ] Multi-language (i18n) support
- [ ] Automated test suite (Jest + Playwright)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 📚 What I Learned

Building HealthNexa was a deep dive into:

- **Full-Stack Architecture** — designing clean separation between client, API, and data layers
- **Real-Time Systems** — Socket.IO room-based queue broadcasting without polling
- **Redis Caching** — session caching and AI result deduplication using SHA-256 input hashing
- **Geo-Spatial Queries** — MongoDB 2dsphere indexes for efficient nearest-location discovery
- **AI Integration** — prompting Gemini for structured JSON clinical output
- **Multi-Role RBAC** — building scalable access control with discrete middleware guards
- **Docker Containerisation** — orchestrating a 5-service stack with Docker Compose
- **Database Modelling** — designing schemas with integrity constraints for healthcare workflows

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Foridul Ibne Qauser**

*Software Engineering Enthusiast · Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-Foridul35962-181717?style=flat&logo=github)](https://github.com/Foridul35962)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/foridul-ibne-qauser/)

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENCE](./LICENCE) file for details.

---

<div align="center">

❤️ **Built to improve healthcare accessibility through technology.**

⭐ Star this repo if you found it helpful!

</div>