# 🚀 Mini ERP – Inventory & Sales Management System (Backend)

A fully scalable, production-ready modular backend built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** with **MongoDB**.

---

## 🛠️ Technology Stack
- **Core Platform:** Node.js (v18+) & Express
- **Language:** TypeScript
- **Database & ORM:** MongoDB Atlas + Prisma ORM
- **Authentication:** JSON Web Tokens (JWT) + BcryptJS
- **Hosting Platform:** Vercel (Ready configuration)
- **Image Cloud Storage:** Cloudinary (via memory-buffered streams)

---

## ✨ Core Features
1. **Authentication & RBAC (Role-Based Access Control):**
   - Email & Password Login.
   - Secure token handling via HTTP headers (`Bearer {{token}}`).
   - Standard roles: `ADMIN`, `MANAGER`, and `EMPLOYEE`.
2. **Dynamic Categories Module:**
   - Add, retrieve, edit, and delete dynamic categories.
   - Restrict deletions of categories containing associated products to prevent database constraints violations.
3. **Products Module:**
   - **Auto-Generated SKU:** Meaningful and sequential SKUs are automatically computed on the backend using the pattern: `[CAT_PREFIX]-[PROD_PREFIX]-[SEQUENCE]` (e.g. `ELC-LAP-0001`).
   - **Memory Storage Image Upload:** Multipart image uploads stream directly to Cloudinary from RAM buffers without writing files to local disk, optimizing performance and server health.
   - Search by name/SKU, pagination, sorting, and category filters.
4. **Transactional Sales Module:**
   - Atomic database transactions (`prisma.$transaction`) check stock levels, update product stocks, calculate grand totals, and store sale transaction history safely.
5. **Dashboard Insights Module:**
   - Returns counts for total products, low stock products (`stock < 5`), total sales count, and total sales revenue.

---

## 📁 Project Architecture
The project follows a clean **modular architecture** design:
```text
src/
├── app/
│   ├── config/             # Environment configurations
│   ├── errors/             # Global error classes
│   ├── middlewares/        # Authentication, request validation, and error handlers
│   ├── modules/            # Domain-driven modules (auth, user, category, product, sale, dashboard)
│   │   ├── auth/           # Routes, controllers, services, interfaces
│   │   ├── category/
│   │   ├── product/
│   │   ├── sale/
│   │   └── dashboard/
│   └── routes/             # Centralized routing registry
├── prisma/
│   ├── schema.prisma       # Database core setups
│   ├── enum.prisma         # Database enums
│   ├── user.prisma         # User schema
│   ├── category.prisma     # Dynamic categories schema
│   ├── product.prisma      # Products schema
│   └── sale.prisma         # Sales and SaleItems schema
├── app.ts                  # Express application setup
└── server.ts               # Server bootstrapping and DB seeding
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
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

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Password Hashing
SALT_ROUNDS=12
```

### 3. Generate Database Client & Seed DB
Generate the Prisma Client and start the development server. The server will automatically seed initial accounts for testing:
- **Admin:** `admin@gmail.com` (Password: `123456`)
- **Manager:** `manager@gmail.com` (Password: `123456`)
- **Employee:** `employee@gmail.com` (Password: `123456`)

```bash
npx prisma generate
npm run dev
```

---

## 📡 API Endpoint Reference

### 🔐 Authentication Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Public | Log in and receive JWT token |

### 📂 Categories Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/categories` | `POST` | `ADMIN`, `MANAGER` | Create dynamic category |
| `/categories` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | List all categories |
| `/categories/:id` | `PATCH` | `ADMIN`, `MANAGER` | Update category details |
| `/categories/:id` | `DELETE` | `ADMIN`, `MANAGER` | Delete category |

### 📦 Products Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/products` | `POST` | `ADMIN`, `MANAGER` | Create product (Multipart Image required) |
| `/products` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | List products (Search, Paginate, Filter) |
| `/products/:id` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | Get product details by ID |
| `/products/:id` | `PATCH` | `ADMIN`, `MANAGER` | Update product details (Multipart) |
| `/products/:id` | `DELETE` | `ADMIN`, `MANAGER` | Delete product |

### 🛒 Sales Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/sales` | `POST` | `ADMIN`, `MANAGER`, `EMPLOYEE` | Create sale order (decrements stock) |
| `/sales` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | View all sales history |
| `/sales/my-sales` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | View logged-in user sales |
| `/sales/:id` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | Get single sale details by ID |

### 📊 Dashboard Module
| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/dashboard/insights` | `GET` | `ADMIN`, `MANAGER`, `EMPLOYEE` | Get ERP statistics & Low Stock alert list |

---

## 🧪 Postman Collection
An optimized Postman collection has been prepared with environment variables and automated token-passing scripts:
- **File Name:** `backend-api.postman_collection.json` (Import directly into Postman)
