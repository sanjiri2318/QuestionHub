# QuestionHub

A full-stack web application for managing and sharing previous year question papers. Built with React, Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Material UI, React Query    |
| Backend    | Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL    |
| Auth       | JWT (access + refresh tokens), bcrypt                   |
| Validation | Zod 4 (server + client)                                 |
| Build      | Vite (client), ts-node (server)                         |

## Project Structure

```
QuestionHub/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # App-wide components (GlobalSearch, NotificationBell, etc.)
│   │   │   ├── student/     # Student-specific components
│   │   │   └── ui/          # Shared presentational components (StatCard, MiniBarChart)
│   │   ├── contexts/        # React contexts (Auth, Theme, Notification)
│   │   ├── hooks/           # Custom React hooks (usePapers, useAdmin, etc.)
│   │   ├── layouts/         # Page layouts (Student, Admin, Auth)
│   │   ├── pages/           # Route pages
│   │   │   ├── admin/       # Admin portal pages
│   │   │   ├── auth/        # Login, Register, Forgot/Reset Password
│   │   │   └── student/     # Student portal pages
│   │   ├── services/        # API service layer (axios)
│   │   └── utils/           # Types, validators, helpers
│   └── vite.config.ts
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, validation, error handling, upload
│   │   ├── prisma/          # Prisma client instance
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── validators/      # Zod schemas
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # Uploaded paper files (gitignored)
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** or **yarn**

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url> QuestionHub
cd QuestionHub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a secure JWT_SECRET

# Client
cd ../client
cp .env.example .env
# VITE_API_URL defaults to http://localhost:3001/api
```

### 3. Set up the database

```bash
cd server

# Create the database (if it doesn't exist)
# Using psql: CREATE DATABASE questionhub;

# Run Prisma migrations
npx prisma migrate dev

# Seed an admin user (optional, or register via the UI and promote in DB)
```

### 4. Start development servers

```bash
# Terminal 1 — Server (runs on port 3001)
cd server
npm run dev

# Terminal 2 — Client (runs on port 5173)
cd client
npm run dev
```

The frontend proxies API requests to the backend in development mode.

## Features

### Student Portal

- **Dashboard** — Overview with stats, recent papers, bookmarks, download activity
- **Browse Papers** — Filter by department, semester, subject, exam year/month; sort and search; PDF preview
- **Bookmarks** — Save and manage bookmarked papers
- **Downloads** — View download history with PDF preview
- **Profile** — View/edit profile, change password

### Admin Portal

- **Dashboard** — Stats, charts, pending approvals, activity log
- **Manage Students** — Approve/reject registrations, search and paginate
- **Manage Departments** — CRUD with usage counts
- **Manage Subjects** — CRUD organized by department, with paper counts
- **Upload Papers** — Multi-step upload with file drag-and-drop
- **Manage Papers** — List, sort, edit, delete existing papers
- **Audit Logs** — Searchable audit trail with stats and date filtering
- **Admin Profile** — View/edit profile, change password

### Shared

- **Dark/Light mode** toggle
- **Global search** (Ctrl+K) across papers, subjects, departments
- **Notification system** with real-time bell and snackbar toasts
- **Lazy-loaded routes** with Suspense fallbacks
- **Responsive design** — Works on mobile, tablet, and desktop
- **Role-based routing** — Protected routes, public-only routes

## API Endpoints

### Authentication

| Method | Endpoint                       | Description            | Auth    |
| ------ | ------------------------------ | ---------------------- | ------- |
| POST   | `/api/auth/register`           | Register new student   | Public  |
| POST   | `/api/auth/login`              | Login                  | Public  |
| POST   | `/api/auth/logout`             | Logout                 | JWT     |
| POST   | `/api/auth/refresh-token`      | Refresh access token   | Public  |
| POST   | `/api/auth/forgot-password`    | Request password reset | Public  |
| POST   | `/api/auth/reset-password`     | Reset password         | Public  |
| GET    | `/api/auth/profile`            | Get current profile    | JWT     |
| PUT    | `/api/auth/profile`            | Update profile         | JWT     |
| PUT    | `/api/auth/change-password`    | Change password        | JWT     |

### Papers (Student)

| Method | Endpoint                       | Description              | Auth    |
| ------ | ------------------------------ | ------------------------ | ------- |
| GET    | `/api/papers`                  | List papers (paginated)  | JWT     |
| GET    | `/api/papers/recent`           | Recent papers            | JWT     |
| GET    | `/api/papers/dashboard/stats`  | Student dashboard stats  | JWT     |
| GET    | `/api/papers/:id`              | Get paper by ID          | JWT     |
| GET    | `/api/papers/:id/download`     | Download paper PDF       | JWT     |
| POST   | `/api/papers/:id/bookmark`     | Bookmark a paper         | JWT     |
| DELETE | `/api/papers/:id/bookmark`     | Remove bookmark          | JWT     |
| GET    | `/api/papers/bookmarks`        | List bookmarks           | JWT     |
| GET    | `/api/papers/downloads`        | Recent downloads         | JWT     |

### Papers (Admin)

| Method | Endpoint                       | Description              | Auth       |
| ------ | ------------------------------ | ------------------------ | ---------- |
| POST   | `/api/papers/upload`           | Upload paper (multipart) | Admin      |
| PUT    | `/api/papers/:id`              | Update paper             | Admin      |
| DELETE | `/api/papers/:id`              | Delete paper             | Admin      |

### Admin Management

| Method | Endpoint                          | Description              | Auth  |
| ------ | --------------------------------- | ------------------------ | ----- |
| GET    | `/api/admin/stats`                | Dashboard statistics     | Admin |
| GET    | `/api/admin/chart-data`           | Chart data               | Admin |
| GET    | `/api/admin/activity-logs`        | Activity logs            | Admin |
| GET    | `/api/admin/students/pending`     | Pending students         | Admin |
| GET    | `/api/admin/students`             | All students (paginated) | Admin |
| PUT    | `/api/admin/students/:id/approve` | Approve student          | Admin |
| PUT    | `/api/admin/students/:id/reject`  | Reject student           | Admin |
| GET    | `/api/admin/departments`          | List departments         | Admin |
| POST   | `/api/admin/departments`          | Create department        | Admin |
| PUT    | `/api/admin/departments/:id`      | Update department        | Admin |
| DELETE | `/api/admin/departments/:id`      | Delete department        | Admin |
| GET    | `/api/admin/subjects`             | List subjects            | Admin |
| POST   | `/api/admin/subjects`             | Create subject           | Admin |
| PUT    | `/api/admin/subjects/:id`         | Update subject           | Admin |
| DELETE | `/api/admin/subjects/:id`         | Delete subject           | Admin |

### Audit Logs

| Method | Endpoint                       | Description         | Auth  |
| ------ | ------------------------------ | ------------------- | ----- |
| GET    | `/api/admin/audit-logs`        | List audit logs     | Admin |
| GET    | `/api/admin/audit-logs/stats`  | Audit log stats     | Admin |

### Notifications

| Method | Endpoint                       | Description           | Auth  |
| ------ | ------------------------------ | --------------------- | ----- |
| GET    | `/api/notifications`           | List notifications    | JWT   |
| PUT    | `/api/notifications/:id/read`  | Mark as read          | JWT   |
| PUT    | `/api/notifications/read-all`  | Mark all as read      | JWT   |
| DELETE | `/api/notifications/:id`       | Delete notification   | JWT   |
| DELETE | `/api/notifications`           | Clear all             | JWT   |

### Public

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| GET    | `/health`          | Health check  |
| GET    | `/api/departments` | List departments |
| GET    | `/api/departments/:id/subjects` | Subjects by department |
| GET    | `/api/departments/subjects`     | All subjects |
| GET    | `/api/search`      | Global search |

## Production Deployment

### 1. Build the client

```bash
cd client
npm run build    # Output: client/dist/
```

Serve `client/dist/` with a static file server (Nginx, Vercel, Netlify, etc.).

### 2. Build and start the server

```bash
cd server
npm run build    # Output: server/dist/
npm start        # Runs: node dist/index.js
```

### 3. Environment variables (production)

Set the following in your hosting environment:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### 4. Database

```bash
cd server
npx prisma migrate deploy    # Apply pending migrations
```

### 5. Reverse proxy (Nginx example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

## Security Features

- **Helmet** — Security headers (CSP, X-Frame-Options, etc.)
- **CORS** — Configurable origin whitelist
- **Rate limiting** — General (100 req/15min) + stricter auth (20 req/15min)
- **JWT** — Short-lived access tokens + refresh token rotation
- **bcrypt** — Password hashing with salt rounds
- **Zod validation** — Input validation on both client and server
- **Path traversal protection** — File download path validation
- **Role-based access** — Student/Admin authorization middleware
- **Admin approval** — New students require admin approval

## License

MIT
