# CampusBite AI – Smart Canteen Ordering & Management System

A modern full-stack web application for college canteens with AI-powered recommendations, demand prediction, and automated queue time estimation.

## 🚀 Features

- **Students**: Browse menu, search, filter categories, add to cart, UPI/Cash checkout, track order status, leave ML-analyzed reviews.
- **Staff**: Manage live queues, approve orders, and monitor real-time low-stock inventory alerts.
- **Admin**: View AI demand prediction, total revenue, user operations, and overall analytics.
- **AI/ML Integration**: Recommends food based on score algorithms, predicts wait times using order backlog, generates demand regressions via Scikit-Learn.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons + Chart.js
- **Backend**: Python FastAPI + Uvicorn
- **Database**: SQLite (SQLAlchemy + Pydantic ORM mappings)
- **AI/ML**: Pandas, NumPy, Scikit-learn (Linear Regression)

## 📦 Setup Instructions for VS Code

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Setup
1. Open a terminal and navigate to the project root.
2. Activate the virtual environment:
   ```powershell
   cd backend
   .\venv\Scripts\activate
   ```
   *(If you encounter execution policy errors, run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`)*
3. Install dependencies:
   ```powershell
   pip install fastapi uvicorn sqlalchemy passlib bcrypt python-jose[cryptography] pydantic python-multipart pandas numpy scikit-learn
   ```
4. Seed the initial fake data:
   ```powershell
   python -m backend.seed
   ```
5. Run the FastAPI Development Server:
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```
   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
1. Open a *new* terminal split in VS Code.
2. Navigate to the frontend directory:
   ```powershell
   cd frontend
   npm install
   ```
3. Run the Vite Development Server:
   ```powershell
   npm run dev
   ```
4. Access the web app at `http://localhost:5173/`

### 4. Direct Run Helper
Alternatively, you can just double click `run_all.bat` from the root directory which will attempt to boot both servers in separate windows.

## 🔑 Demo Login Credentials

You can test the application using the following automatically seeded accounts (or register a fresh student account!):

- **Admin Account:** `admin@campusbite.com` / `admin123`
- **Staff Account:** `staff@campusbite.com` / `staff123`
- **Student Account:** `student@example.com` / `student123`
