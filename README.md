# Fullstack Retail Web App

A full-stack retail application built with **Vue 3 + Vite** on the frontend and **Express + TypeScript** on the backend.  
This project demonstrates a simple e-commerce workflow with a product catalog, REST API, and modular structure.

---

## 📁 Project Structure

Fullstack-Retail-Web-App/
├─ retail-backend/ # Express API, TypeScript, PostgreSQL
├─ retail-frontend/ # Vue 3 + Vite frontend
└─ README.md

yaml
Copy code

---

## 🛠 Technologies Used

**Frontend:**
- Vue 3
- Vite
- TypeScript
- Vue Router

**Backend:**
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT Authentication (for admin routes)

**Other:**
- Fetch API for frontend-backend communication
- CORS enabled
- Git & GitHub for version control

---

## ⚡ Getting Started

### Backend

1. Navigate to the backend folder:

```bash
cd retail-backend
Install dependencies:

bash
Copy code
npm install
Set up environment variables in a .env file (example):

ini
Copy code
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/yourdb
JWT_SECRET=your_secret
Run the backend:

bash
Copy code
npm run dev
Backend API should now be running at http://localhost:3000.

Frontend
Navigate to the frontend folder:

bash
Copy code
cd retail-frontend
Install dependencies:

bash
Copy code
npm install
Run the frontend:

bash
Copy code
npm run dev
Frontend should now be running at http://localhost:5173 (or Vite’s port).

🔗 API Endpoints
Products:

GET /products — List all products

POST /products — Add a new product (Admin only, JWT protected)

🚀 Features
Fetch products from backend dynamically

Display products in a responsive grid

Modular structure: services, components, pages

Ready for admin routes and cart functionality

Fully typed with TypeScript

📌 Notes
Ensure your PostgreSQL database is running and properly configured.

CORS must be enabled in backend for frontend requests.

Node.js v18+ recommended.

📄 License
MIT License
