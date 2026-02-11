# Fullstack Retail Web App 🛍️

A modern full-stack retail application built with **Vue 3 + Vite** frontend and **Express + TypeScript** backend.  
Showcases a product catalog, REST API, and modular architecture — perfect for portfolio or real-world projects.

---

## 🌟 Features

- Dynamic product grid fetching data from backend  
- Responsive layout for desktop & mobile  
- Modular frontend with **components, pages, services, router**  
- Backend API with **Express + PostgreSQL + JWT authentication**  
- Fully typed with **TypeScript**  
- Ready for admin functionality & shopping cart integration  

---

## 🏗 Tech Stack

**Frontend:** Vue 3, Vite, TypeScript, Vue Router  
**Backend:** Node.js, Express, TypeScript, PostgreSQL  
**Other:** Fetch API, CORS, Git & GitHub  

---

## ⚡ Getting Started

### Backend

```bash
cd retail-backend
npm install
Create a .env file:

ini
Copy code
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/yourdb
JWT_SECRET=your_secret
Run backend:

bash
Copy code
npm run dev
Frontend
bash
Copy code
cd retail-frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.

🔗 API Endpoints
GET /products — Fetch all products

POST /products — Add a product (Admin, JWT protected)

📝 Notes
Make sure PostgreSQL is running and configured

CORS enabled for frontend-backend communication

Node.js v18+ recommended

📂 Project Structure
bash
Copy code
Fullstack-Retail-Web-App/
├─ retail-backend/       # Express API
├─ retail-frontend/      # Vue 3 + Vite frontend
└─ README.md
📄 License
MIT
