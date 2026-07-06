# 🚀 Smart Project & Task Collaboration System (SPTC-System) - Backend

A fully scalable, production-ready modular backend built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** with **MongoDB**.

## 🌐 Live URL
- **Production API URL:** [https://sptc-system-backend.vercel.app](https://sptc-system-backend.vercel.app)
- **Base Endpoint:** `https://sptc-system-backend.vercel.app/api/v1`

---

## 🛠️ Technology Stack
- **Core Platform:** Node.js (v18+) & Express
- **Language:** TypeScript
- **Database & ORM:** MongoDB Atlas + Prisma ORM
- **Authentication:** JSON Web Tokens (JWT) + BcryptJS
- **Hosting Platform:** Vercel

---

## ✨ Features
1. **Authentication & RBAC:**
   - Email & Password Signup & Login.
   - Secure token handling via HTTP headers (`Bearer {{token}}`).
   - Role-Based Access Control: `ADMIN`, `PROJECT_MANAGER`, and `TEAM_MEMBER`.
2. **Project Management:**
   - Create, retrieve, update, and delete projects.
   - Project memberships: Only members assigned to a project can collaborate on its tasks.
   - Cascade delete: Deleting a project automatically deletes all related tasks.
3. **Task Management (With Strict Validations):**
   - No duplicate task titles allowed within the same project.
   - Due dates cannot be set to a past date.
   - Tasks can only be assigned to users who are members of the corresponding project.
   - Completed tasks cannot be re-assigned.
   - **Role restrictions:** Team members can only update the `status` of tasks assigned to them, while Admins & Project Managers have full edit access.
4. **Activity Logs:**
   - Automatically records audit trails for project modifications, task creation, and member assignments.
5. **Dashboard Insights:**
   - Aggregated KPIs for total, pending, and completed projects/tasks.
   - Real-time work progress overview and member workload distribution.

---

## 📁 Project Architecture
The project follows a clean **modular architecture** design:
```text
src/
├── app/
│   ├── config/             # Environment configurations
│   ├── errors/             # Global error classes
│   ├── middlewares/        # Authentication and error handling middlewares
│   ├── modules/            # Domain-driven modules (auth, project, task, activityLog, user, dashboard)
│   │   ├── auth/           # Route, Controller, Service, Validation
│   │   ├── project/
│   │   ├── task/
│   │   ├── activityLog/
│   │   └── dashboard/
│   └── routes/             # Centralized routing registry
├── prisma/
│   ├── schema.prisma       # Database schemas
│   └── enum.prisma         # Centralized Prisma database enums
├── app.ts                  # Express application setup
└── server.ts               # Server bootstrapping and DB seeding
```

---

## 🚀 How to Run Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/nayeem-miah/sptc-system-backend.git
cd sptc-system-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=8321
DATABASE_URL="your-mongodb-atlas-connection-string"
NODE_ENV=development

# JWT Secret Keys
JWT_ACCESS_SECRET="your-jwt-access-token-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-token-secret"
JWT_ACCESS_EXPIRES_IN=5d
JWT_REFRESH_EXPIRES_IN=30d

# Password Hashing
SALT_ROUNDS=12
```

### 3. Generate Database Client & Seed DB
Run the Prisma generate command and start the server. The server automatically seeds initial accounts for testing:
- **Admin:** `admin@gmail.com` (Password: `123456`)
- **Project Manager:** `pm@gmail.com` (Password: `123456`)
- **Team Member:** `member@gmail.com` (Password: `123456`)

```bash
npx prisma generate
npm run dev
```

---

## 📡 API Endpoint Reference

### 🔐 Authentication Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Public | Register a new user |
| `/auth/login` | `POST` | Public | Log in and receive JWT token |

### 📁 Project Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/projects` | `POST` | `ADMIN`, `PROJECT_MANAGER` | Create a new project |
| `/projects` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get projects list (with filter/search) |
| `/projects/:id` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get single project by ID |
| `/projects/:id` | `PATCH` | `ADMIN`, `PROJECT_MANAGER` | Update project details |
| `/projects/:id` | `DELETE` | `ADMIN`, `PROJECT_MANAGER` | Delete project (cascades tasks) |

### 📝 Task Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/tasks` | `POST` | `ADMIN`, `PROJECT_MANAGER` | Create and assign a task |
| `/tasks` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get all tasks (with filters & search) |
| `/tasks/:id` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get single task details |
| `/tasks/:id` | `PATCH` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Update task details (Team member can update status only) |
| `/tasks/:id` | `DELETE` | `ADMIN`, `PROJECT_MANAGER` | Delete task |

### 📊 Dashboard & Activity Modules
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/dashboard/insights` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get analytics KPIs and workload distribution |
| `/activities` | `GET` | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Get recent audit trail logs |

---

## 🧪 Postman Collection
The API collection containing predefined environment variables and requests for testing all flows is stored at:
- **File Path:** [backend-api.postman_collection.json](backend-api.postman_collection.json)
