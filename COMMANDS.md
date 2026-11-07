# 🚀 Reunite — Complete Step-by-Step Run Guide & Commands

This guide provides all the commands and steps required to run the **Reunite** (Lost & Found Management Platform) on your Windows machine.

---

## ⚡ Option A: One-Click Startup (Easiest)

You can launch everything automatically with the included launch script:

1. Double-click **`start.bat`** in the project root (`LostandFound\start.bat`).
2. Two terminal windows will open:
   - **Terminal 1**: Django Backend API (`http://127.0.0.1:8000`)
   - **Terminal 2**: React Frontend UI (`http://localhost:5173`)
3. Open your browser at: 👉 [**http://localhost:5173**](http://localhost:5173)

---

## 🛠️ Option B: Step-by-Step Manual Commands

If you prefer to start each service manually in your own terminal windows, follow these 3 steps:

---

### Step 1: Ensure MongoDB is Running

Before starting the backend, make sure MongoDB is running on port `27017`.

**In Command Prompt (Admin) or PowerShell**:
```cmd
net start MongoDB
```

*Or, verify using mongosh:*
```cmd
mongosh
```
*(If you see `test>`, MongoDB is active. Type `exit` to return to your shell).*

---

### Step 2: Start the Backend (Django REST Framework)

Open **Terminal 1**, navigate to the `backend` folder, activate the virtual environment, and run the server:

```cmd
cd C:\Users\Admin\Desktop\LostandFound\backend
```

**1. Activate Virtual Environment:**
```cmd
.\venv\Scripts\activate
```
*(On PowerShell, if script execution is restricted, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, or run directly: `.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000`)*

**2. (First-time only) Install dependencies and run migrations:**
```cmd
pip install -r requirements.txt
python manage.py migrate
```

**3. Start the Django development server:**
```cmd
python manage.py runserver 127.0.0.1:8000
```

> **Backend is now active at:** `http://127.0.0.1:8000/`  
> **API Health Check:** `http://127.0.0.1:8000/api/health/`

---

### Step 3: Start the Frontend (React + Vite)

Open **Terminal 2**, navigate to the `frontend` directory, install packages, and launch Vite:

```cmd
cd C:\Users\Admin\Desktop\LostandFound\frontend
```

**1. (First-time only) Install frontend packages:**
```cmd
npm install
```

**2. Start the development server:**
```cmd
npm run dev
```

> **Frontend is now active at:** `http://localhost:5173/`

---

## 🔑 Access & Login Instructions

1. Open your browser and go to:
   👉 **[http://localhost:5173/](http://localhost:5173/)**
2. **Authentication Gate**: Any user must log in before they can proceed to browse items, report lost items, or submit claims.
3. You can:
   - **Option 1 (Instant Preview)**: Click **"Instant Demo Login (Proceed as Guest Demo)"** to log in immediately with one click.
   - **Option 2 (Create Account)**: Switch to the **Create Account** tab, enter your details (Name, Username, Email, Password), and click **Create Account & Proceed**.
   - **Option 3 (Sign In)**: Use your registered credentials or demo credentials:
     - **Username**: `demo_user`
     - **Password**: `password123`

---

## 📋 Quick Reference Command Cheat Sheet

| Action | Command | Working Directory |
| :--- | :--- | :--- |
| **Check MongoDB** | `mongosh` or `net start MongoDB` | Anywhere |
| **Activate Python Venv** | `.\backend\venv\Scripts\activate` | `backend/` |
| **Run Migrations** | `python manage.py migrate` | `backend/` |
| **Run Backend Server** | `python manage.py runserver 127.0.0.1:8000` | `backend/` |
| **Install Frontend Deps**| `npm install` | `frontend/` |
| **Run Frontend Server**| `npm run dev` | `frontend/` |
| **Build Frontend** | `npm run build` | `frontend/` |

---

## ❓ Troubleshooting

- **Page not loading / "Connection Refused"**:
  Ensure both Terminal 1 (Django) and Terminal 2 (Vite) are running and have not thrown errors.
- **Port 5173 vs 8000**:
  Port `5173` is the interactive web user interface. Port `8000` is the backend REST API. Visiting `http://127.0.0.1:8000/` will automatically redirect you to port `5173`.
- **Database Connection Error**:
  Verify MongoDB is running by executing `mongosh` in terminal.

