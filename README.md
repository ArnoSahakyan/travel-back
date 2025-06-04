
# 🌍 Wanderluxe Travel API (WIP)

This is the backend for **Wanderluxe**, a full-stack travel agency application built with Node.js, Express, PostgreSQL, and Sequelize ORM.

> ⚠️ Project is a work in progress. Expect changes and improvements.

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express (ES Modules)
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Environment Management**: dotenv
- **Roles**: Admin / Customer
- **Associations**: Sequelize-defined relationships (Users, Tours, Bookings, Reviews, etc.)

---

## 📦 Project Structure

```
📁 models/          # Sequelize model definitions
📁 controllers/     # Auth & user logic
📁 routes/          # Express route handlers
📁 middleware/      # JWT & role verification
📁 config/          # (Optional) Sequelize CLI config
.env                # Environment variables
server.js           # Entry point
```

---

## 🧪 Features (in progress)

- ✅ User Signup / Login with JWT
- ✅ Role-based Access (admin & customer)
- ✅ Tour and Destination Models
- ✅ Favorites, Bookings, Reviews
- 🔄 Refresh Tokens
- 🔜 Admin management panel
- 🔜 Blog & Newsletter functionality
- 🔜 Real-time notifications

---

## 📋 Environment Variables

Create a `.env` file with the following:

```env
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost

ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Set up your PostgreSQL database

Create a database manually or via Sequelize migrations (if using CLI).

### Run the server

```bash
npm start
```

---

## 📬 API Routes (sample)

| Method | Endpoint          | Description               |
|--------|-------------------|---------------------------|
| POST   | /auth/signup      | Register a new user       |
| POST   | /auth/signin      | Login and get tokens      |
| GET    | /users/me         | Get logged-in user info   |
| POST   | /auth/refresh     | Refresh access token      |

---

## 🙌 Contributing

This is a solo/learning project right now, but if you're interested in collaborating, feel free to reach out or fork!

---