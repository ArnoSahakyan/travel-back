# 🌍 Wanderluxe Travel API (WIP)

This is the backend for **Wanderluxe**, a full-stack travel agency platform built with **Node.js**, **Express**, **PostgreSQL**, and **Sequelize**, using **TypeScript** and modular architecture.

> ⚠️ This project is still in development — breaking changes and new features may be added frequently.

---

## 🛠 Tech Stack

- **Runtime**: Node.js + Express (ES Modules + TypeScript)
- **ORM**: Sequelize with CLI and Migrations
- **Database**: PostgreSQL
- **File Storage**: Supabase Buckets
- **Authentication**: JWT (Access/Refresh Tokens) + bcrypt
- **Email Service**: Nodemailer + Gmail SMTP
- **Image Processing**: Sharp
- **Roles**: Admin / Customer
- **Other**: Sequelize Associations, Role Middleware, Token Expiration, Email Verification, Password Reset

---

## 📁 Project Structure

```

src/
├── app.ts                # Express app setup
├── index.ts              # Server entry point
├── constants/            # Static values and configuration
├── controllers/          # Route logic (auth, user, contact, etc.)
├── db/
│   ├── config/           # Sequelize config
│   ├── migrations/       # Migration files
│   ├── models/           # Sequelize model definitions
│   └── seeders/          # Seeder files
├── emails/               # Email templates (HTML)
├── middlewares/          # Auth & role middleware
├── routes/               # Route definitions
├── types/                # Custom TS types (e.g., request typings)
└── utils/                # Utility functions (e.g., email sending)

````

---

## ✅ Features

- ✅ User Registration & Login (JWT Auth)
- ✅ Token Refresh Mechanism
- ✅ Password Reset via Email (Secure & Time-limited)
- ✅ User Role System (Admin/Customer)
- ✅ Upload Tour/Destination Images via Supabase
- ✅ Sequelize CLI-based migrations and seeders
- ✅ Contact Us & Newsletter System
- ✅ Modular folder structure with strong typings

Coming soon:

- 🔜 Admin Management Panel
- 🔜 Blog and Comments
- 🔜 Real-Time Notifications
- 🔜 Advanced Filtering & Sorting for Tours

---

## 📦 Environment Variables

Create a `.env` file in the root with:

```env
# Server
PORT=3000

# PostgreSQL
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=wanderluxe_db
DB_HOST=localhost

# Auth
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# CORS (Frontend origin)
CORS=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET_TOURS=tour-images
SUPABASE_BUCKET_DESTINATIONS=destination-images
SUPABASE_BUCKET_BLOGS=blog-images
SUPABASE_PUBLIC_URL=https://your-project.supabase.co/storage/v1/object/public

# Email (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
````

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Setup database

Create the PostgreSQL database manually or run migrations:

```bash
npx sequelize-cli db:migrate
```

Seed initial data (if any):

```bash
npx sequelize-cli db:seed:all
```

### 3. Start development server

```bash
npm run dev
```

To build and run in production:

```bash
npm run build
npm start
```

---

## 🔁 Available Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Starts the server in dev mode using tsx |
| `npm run build`     | Builds the project using TypeScript     |
| `npm start`         | Runs the compiled JS in `dist/`         |
| `npx sequelize-cli` | Run Sequelize migrations/seeders        |

---

## 📬 Sample API Endpoints

| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| POST   | /auth/signup          | Register a new user             |
| POST   | /auth/signin          | Login and receive tokens        |
| POST   | /auth/refresh         | Refresh JWT token               |
| POST   | /auth/request-reset   | Request password reset          |
| POST   | /auth/reset-password  | Complete password reset         |
| PUT    | /user/info            | Update profile info (auth req)  |
| PUT    | /user/password        | Change password (auth req)      |
| POST   | /contact              | Send a message via contact form |
| POST   | /newsletter/subscribe | Subscribe to newsletter         |

---

## 📘 Notes

* The backend is **modular and strongly typed** using `TypedRequest` interfaces.
* Email templates are fully responsive and styled.
* Sequelize models follow **best practices**: field validation, associations, timestamps, soft delete (`paranoid`), and are decoupled from the main `index.ts`.

---

## 🙌 Contributing

This is currently a solo project used for portfolio and learning purposes, but you're welcome to fork or raise issues.

