# 🔐 User Authentication System (React + Spring Boot)

A full-stack web application that provides secure user authentication using **React (frontend)** and **Spring Boot (backend)**. The system allows users to register, log in, and access protected pages with proper session handling.

---

## 🚀 Features

* 🔐 **User Authentication**

  * Login with email & password
  * Secure validation via backend

* 📝 **User Registration**

  * Create new accounts
  * Prevent duplicate users

* 🔄 **Session Management**

  * Maintain login state
  * Protected routes in frontend

* 🚪 **Logout**

  * Clear session/token
  * Redirect to home page

* 🧭 **Navigation Flow**

  * Home → Login/Signup → Dashboard
  * Logout → Back to Home

---

## 🖥️ Tech Stack

### 🔹 Frontend

* React.js
* HTML, CSS
* Axios (API calls)
* React Router (navigation)

### 🔹 Backend

* Spring Boot
* REST APIs
* Spring Security (optional)
* Java

### 🔹 Database

* MySQL / H2 (depending on your setup)

---

## 📁 Project Structure

```
Authentication-System/
│
├── frontend/                 # React App
│   ├── src/
│   │   ├── components/       # Login, Signup, Dashboard
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│
├── backend/                  # Spring Boot App
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── application.properties
│
└── README.md
```

---

## 🔄 Application Flow

```
Home Page
   ↓
Login / Signup
   ↓
Backend Authentication (Spring Boot API)
   ↓
Dashboard (Protected Route)
   ↓
Logout → Back to Home
```

---

## 🔗 API Endpoints (Example)

* `POST /api/auth/signup` → Register user
* `POST /api/auth/login` → Authenticate user
* `GET /api/user/profile` → Fetch user data

---

## 🎨 UI Design

* Clean login & signup forms
* Responsive React components
* Sidebar/dashboard after login
* User-friendly navigation

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/authentication-system.git
cd authentication-system
```

---

### 2️⃣ Backend Setup (Spring Boot)

```bash
cd backend
```

* Configure database in `application.properties`
* Run the application:

```bash
mvn spring-boot:run
```

---

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

---

### 🌐 Application URLs

* Frontend: http://localhost:3000
* Backend: http://localhost:8080

---

## 🔐 Authentication Logic

* User submits login/signup form (React)
* Request sent to Spring Boot API
* Backend validates credentials
* On success:

  * Returns response (JWT/session)
  * Frontend stores token/session
* Protected routes allow access only if logged in

---

## ⚠️ Limitations

* Basic authentication (can be improved)
* Token handling may be simple (if not using JWT yet)
* UI can be further enhanced

---

## 📈 Future Enhancements

* 🔐 JWT Authentication
* 🔒 Password hashing (BCrypt)
* 📧 Email verification
* 🔑 Forgot password feature
* ☁️ Deployment (AWS / Render / Vercel)
* 🎨 Improved UI/UX

---

## 🎯 Purpose

This project demonstrates:

* Full-stack development (React + Spring Boot)
* REST API integration
* Authentication flow implementation
* Real-world application architecture

---

## 👨‍💻 Author

* Architha Ojha


---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!
