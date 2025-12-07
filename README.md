A modern full-stack web application built to simplify loan applications, approval workflows, and consultancy services.
Designed with a clean UI, scalable backend, and PostgreSQL database integration.

<p align="center"> <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" /> <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge" /> <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge" /> <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" /> </p>
🌐 Project Overview

VASU Consultancy’s Loan Management System allows users to apply for loans, track application status, and enables admin officers to review and approve loans.

This system is built for real-world workflow automation with clean UI and scalable architecture.

✨ Features
🔷 User Features

Create account & login

Apply for loans

Upload required documents

Track application status

View loan history

🔶 Admin Features

Admin dashboard

View all loan applications

Approve / Reject loans

Email notifications

Data filtering & sorting

🛠 Technical Features

Secure JWT authentication

PostgreSQL relational database

REST API with Express.js

Multer-based file upload

Mobile-responsive UI

Production-ready deployment setup

🧩 Tech Stack
Frontend

React (Vite)

Axios

React Router

CSS / Tailwind (optional)

Backend

Node.js

Express.js

PostgreSQL (pg library)

Multer (File Uploads)

JWT Authentication

Deployment

Frontend: Vercel

Backend: Render / Railway

Database: Cloud PostgreSQL

📁 Folder Structure
project-root/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── vite.config.js
│
└── backend/
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── config/
    ├── uploads/
    └── server.js

⚙️ Environment Variables
Backend .env
PORT=5000
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
JWT_SECRET=
EMAIL_USERNAME=
EMAIL_PASSWORD=

Frontend .env (Vite)
VITE_API_URL=https://your-backend-url.onrender.com

🚀 How to Run Locally
1️⃣ Clone Repository
git clone https://github.com/yourusername/vasu-consultancy.git

2️⃣ Install Dependencies
Frontend
cd frontend
npm install
npm run dev

Backend
cd backend
npm install
npm start

📸 Screenshots (Add your own later)
[Homepage Screenshot]
[User Dashboard Screenshot]
[Admin Panel Screenshot]

🤝 Contributors

👤 Gunadeep Kalla
Full Stack Developer & Designer
Vasu Consultancy

⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub!
Your support motivates further updates and improvements.
