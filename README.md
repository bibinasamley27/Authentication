# Secure MERN Stack Authentication & Authorization Module

A production-ready, highly secure, and modular authentication and role-based authorization system built with Node.js, Express, MongoDB, React, JWT, and bcryptjs.

---

## 🔒 Security Best Practices Implemented

This system has been built from the ground up matching real-world security specifications used in high-risk enterprise platforms:

### 1. Cryptographic Password Hashing (bcryptjs)
Plaintext passwords are never stored. The system hashes user passwords using `bcryptjs` with **12 salt rounds** (industry standard). This introduces high computational complexity, rendering offline brute-force and rainbow table attacks mathematically unfeasible in the event of a database compromise.

### 2. JWT Generation & Verification
Session tokens are signed with the **HMAC-SHA256 algorithm** using a cryptographically random secret key (`JWT_SECRET`) loaded from environment variables. Tokens carry a structured expiration window (defaults to `24h`) and store only non-sensitive payload parameters:
*   `id` (Unique Database Identifier)
*   `email` (Unique lowercase user email)
*   `role` (The account privilege level: `"user"` or `"admin"`)

### 3. Secure Token Storage (httpOnly Cookies vs LocalStorage)
For live production deployments, this system is pre-configured to store and read JWT sessions inside **HttpOnly Secure SameSite=Strict Cookies**.
*   **XSS Protection**: Storing JWTs in `localStorage` or `sessionStorage` exposes tokens to Cross-Site Scripting (XSS) attacks. If an attacker injects a malicious script, they can query storage keys and hijack active sessions. **HttpOnly Cookies are completely invisible to client-side JavaScript execution**, blocking XSS-based token theft.
*   **CSRF Protection**: We mitigate Cross-Site Request Forgery (CSRF) by enforcing the `SameSite: "strict"` cookie policy, instructing browsers to omit session credentials from cross-origin requests.
*   **Transport Safety**: In production mode (`NODE_ENV === "production"`), the `secure` flag is set to `true`, forcing the cookie to be sent exclusively over encrypted SSL/TLS (HTTPS) channels.

### 4. Input Validation & Sanitization (express-validator)
All user-provided fields undergo rigorous type, pattern, and length validation at the gateway level before hitting business logic handlers. This blocks SQL/NoSQL Injection vectors, buffer overflows, and invalid type exceptions.

---

## 📁 Modular MVC Folder Architecture

The codebase utilizes a clean, decoupled MVC separation of concerns:

```text
/src/
├── backend/
│   ├── config/
│   │   └── db.ts               # Hybrid database loader (Live MongoDB vs Sandbox Preview)
│   ├── controllers/
│   │   ├── authController.ts   # Registrations, Logins, Profile lookups, and Logouts
│   │   └── taskController.ts   # Protected CRUD operations for our Task resource
│   ├── middleware/
│   │   ├── authMiddleware.ts   # Extracts, decodes, and validates JWT sessions
│   │   └── roleMiddleware.ts   # Role-based restriction middleware (RBAC)
│   ├── models/
│   │   ├── User.ts             # User Schemas, interfaces, and repository mappings
│   │   └── Task.ts             # Task Schemas, interfaces, and repository mappings
│   ├── routes/
│   │   ├── authRoutes.ts       # Router mapping for authentication endpoints
│   │   └── taskRoutes.ts       # Router mapping for task CRUD endpoints
│   ├── utils/
│   │   └── jwtHelper.ts        # Signs and verifies cryptographically secure tokens
│   └── validators/
│       ├── authValidator.ts    # Sanitize and validate registration/login payloads
│       └── taskValidator.ts    # Sanitize and validate task CRUD payloads
├── components/
│   └── ProtectedRoute.tsx      # Core frontend routing guard (supports RBAC checking)
├── context/
│   └── AuthContext.tsx         # Unified state provider for user context and operations
├── pages/
│   ├── Login.tsx               # Login page with input validations and quick demo buttons
│   ├── Register.tsx            # Register page with animated password-strength indicators
│   ├── Dashboard.tsx           # Multi-role dashboard showing User vs Admin views
│   └── Unauthorized.tsx        # High-contrast restricted landing card
├── services/
│   └── api.ts                  # Axios client configured with automatic request/response interceptors
├── types.ts                    # Global shared typescript interface models
├── App.tsx                     # Core Client Router mapping pages & route protections
└── index.css                   # Tailwind imports and customized brand typography
/server.ts                      # Applet Entry Point merging Express endpoints & Vite
```

---

## 📡 API Endpoints Specification

### Authentication Enclave

#### 1. Register a New Account
*   **Route**: `POST /api/auth/register`
*   **Access**: Public
*   **Headers**: `Content-Type: application/json`
*   **Body JSON Payload**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@company.com",
      "password": "StrongPassword!23",
      "role": "user" 
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Registration successful! Welcome aboard.",
      "token": "eyJhbGciOi...",
      "user": {
        "id": "64bf0a3...",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "user",
        "createdAt": "2026-06-28T18:32:00.000Z"
      }
    }
    ```

#### 2. Log In Existing User
*   **Route**: `POST /api/auth/login`
*   **Access**: Public
*   **Body JSON Payload**:
    ```json
    {
      "email": "jane@company.com",
      "password": "StrongPassword!23"
    }
    ```
*   **Response (200 OK)**: Sets an `HttpOnly` token cookie and returns details in body:
    ```json
    {
      "success": true,
      "message": "Login successful. Welcome back!",
      "token": "eyJhbGciOi...",
      "user": { ... }
    }
    ```

#### 3. Log Out User
*   **Route**: `POST /api/auth/logout`
*   **Access**: Public (Clears active cookie)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Logged out successfully. See you soon!"
    }
    ```

#### 4. Query Current Session Profile
*   **Route**: `GET /api/auth/profile`
*   **Access**: Protected (Requires valid JWT Cookie or Bearer Header)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "user": {
        "id": "64bf0a3...",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "user",
        "createdAt": "2026-06-28T18:32:00.000Z"
      }
    }
    ```

---

### Task Management (Protected Core Resource)

*   All requests must supply validation credentials (`Authorization: Bearer <token>` or httpOnly Cookie).
*   **Standard Users**: Can only fetch, create, update, or delete tasks belonging to them.
*   **Administrators**: Role-Based Access Control overrides allow administrators to list and manage tasks created by **all users** in the system.

#### 1. Fetch Task List
*   **Route**: `GET /api/tasks`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "count": 2,
      "tasks": [
        {
          "id": "abc987",
          "title": "Set up server infrastructure",
          "description": "Install Helmet and CORS on Express",
          "status": "completed",
          "userId": "64bf0a3..."
        }
      ]
    }
    ```

#### 2. Create a Task
*   **Route**: `POST /api/tasks`
*   **Body JSON Payload**:
    ```json
    {
      "title": "Configure Firewalls",
      "description": "Block all inbound traffic except port 3000",
      "status": "pending"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Task created successfully.",
      "task": { ... }
    }
    ```

#### 3. Update a Task
*   **Route**: `PUT /api/tasks/:id`
*   **Body JSON Payload**:
    ```json
    {
      "title": "Configure Firewalls",
      "description": "Block all inbound traffic except port 3000",
      "status": "in-progress"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task updated successfully.",
      "task": { ... }
    }
    ```

#### 4. Delete a Task
*   **Route**: `DELETE /api/tasks/:id`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task deleted successfully."
    }
    ```

---

## 🛠️ Step-by-Step Local Deployment & Operation

### 1. Prerequisite Installations
Ensure you have **Node.js (v18.x or later)** and **npm (v9.x or later)** installed.

### 2. Configure Environment Secrets
Create a `.env` file in the root folder using `.env.example` as a reference:
```bash
PORT=3000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/SecureMERNAuth?retryWrites=true&w=majority"
JWT_SECRET="YOUR_CRYPTOGRAPHIC_SUPER_SECRET_SIGNING_KEY_2026"
JWT_EXPIRES_IN="24h"
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
```

### 3. Launching Locally in Development
Execute the following command in the root folder:
```bash
# This automatically runs tsx on server.ts which starts Express and hooks Vite dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. The workspace is active and hot-reloading!

### 4. Compiling and Launching for Production
```bash
# Compile React assets (Vite) and bundle Express server.ts into dist/server.cjs using esbuild
npm run build

# Start the optimized bundled full-stack production build
npm start
```
The application compiles cleanly into `/dist` and runs standalone on port 3000.
