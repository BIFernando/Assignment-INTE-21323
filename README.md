# Task Management System (TMS) - INTE 21323

A full-stack Task Management System developed as a group project for the **INTE 21323 - Web Application Development** module.

The system enables organizations and teams to manage projects, assign tasks, collaborate through comments, upload attachments, receive real-time notifications, and control access using role-based authentication.

---

# 🚀 Live Deployment

### Production System

* Frontend: https://taskflowtms.sytes.net
* Backend API: https://taskflowtms.sytes.net/api
* Swagger Documentation: http://localhost:5000/api-docs

---

# 🛠 Technologies Used

| Layer                   | Technology                      |
| ----------------------- | ------------------------------- |
| Frontend                | HTML5, CSS3, Vanilla JavaScript |
| Backend                 | Node.js, Express.js             |
| Database                | MySQL 8.0                       |
| ORM                     | Sequelize                       |
| Authentication          | JWT, bcrypt                     |
| Real-Time Communication | Socket.io                       |
| Validation              | express-validator               |
| Security                | Helmet, HPP, Rate Limiting      |
| File Uploads            | Multer                          |
| Documentation           | Swagger UI                      |
| Containerization        | Docker, Docker Compose          |
| Reverse Proxy           | Nginx                           |
| Hosting                 | AWS EC2                         |
| Version Control         | Git & GitHub                    |

---

# ✨ Features

### Authentication & Authorization

* User Login
* User Registration
* JWT Authentication
* Role-Based Access Control

### User Management

* Create Users
* Update Users
* Deactivate Users
* Search Users

### Project Management

* Create Projects
* View Projects
* Invite Members
* Update Member Roles
* Remove Members

### Task Management

* Create Tasks
* Update Tasks
* Delete Tasks
* Assign Users
* Task Filtering

### Collaboration

* Task Comments
* File Attachments
* Real-Time Notifications

### Security

* Password Hashing
* Route Protection
* Input Validation
* Rate Limiting
* Secure Headers

---

# 📚 API Documentation

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

The API documentation includes:

* Authentication APIs
* User APIs
* Project APIs
* Task APIs
* Notification APIs

---

# ⚙️ Local Setup

## Prerequisites

Install:

* Node.js (v20+)
* MySQL 8+
* Docker Desktop (Optional)
* Git

---

## Clone Repository

```bash
git clone <repository-url>
cd Assignment-INTE-21323
```

---

## Backend Setup

```bash
cd Backend
npm install
```

Create `.env`

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tms_database

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:3000
```

---

## Start Backend

```bash
npm run dev
```

or

```bash
node server.js
```

---

## Frontend Setup

Open:

```text
Frontend/pages/login.html
```

or use:

```bash
Live Server Extension
```

---

# 🐳 Docker Deployment

Build and run containers:

```bash
docker-compose up --build
```

Check running containers:

```bash
docker ps
```

Stop containers:

```bash
docker-compose down
```

---

# 🔑 Test Credentials

| Role  | Email                                 | Password     |
| ----- | ------------------------------------- | ------------ |
| Admin | [admin@tms.com](mailto:admin@tms.com) | Password123! |

---

# 📂 Project Structure

```text
Assignment-INTE-21323
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── services
│   ├── sql
│   ├── tests
│   ├── uploads
│   ├── utils
│   ├── .env
│   ├── Dockerfile
│   ├── server.js
│   ├── index.js
│   └── package.json
│
├── Frontend
│   ├── components
│   ├── context
│   ├── css
│   ├── js
│   ├── pages
│   ├── services
│   ├── src
│   ├── Dockerfile
│   ├── nginx.conf
│   └── index.html
│
├── Docs
│
├── .github
│
├── docker-compose.yml
│
└── README.md
```

---

# ☁️ Deployment Architecture

```text
Users
   │
   ▼
Nginx Reverse Proxy
   │
   ├── Frontend Container (Port 3000)
   │
   └── Backend Container (Port 5000)
            │
            ▼
        MySQL Container
```

Hosted on:

* AWS EC2 (Ubuntu)
* Docker Containers
* Nginx Reverse Proxy
* Let's Encrypt SSL
* No-IP Dynamic DNS

---

# 👥 Team Members

| Member   | Responsibility                   |
| -------- | -------------------------------- |
| Member 1 | Project Management               |
| Member 2 | Authentication & User Management |
| Member 3 | Task Management                  |
| Member 4 | Frontend Development             |
| Member 5 | Real-Time Notifications          |
| Member 6 | DevOps, Docker & Deployment      |

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing (bcrypt)
* Route Authorization
* Express Rate Limiting
* Helmet Security Headers
* Input Validation
* Secure File Upload Handling

---

# 📄 License

Developed for academic purposes as part of the INTE 21323 module at the University of Kelaniya.
