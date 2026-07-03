# Blog Management System

A responsive, high-performance blog management platform. The application consists of a Django REST Framework backend and a React (Vite) frontend.

---

## 🛠️ Technology Stack
* **Backend**: Django & Django REST Framework (DRF)
* **Frontend**: React (Vite), Vanilla CSS
* **Database**: SQLite (Local file-based)

---

## 📂 Project Structure
* `/backend` — Django project files, SQLite database, unit tests, and API endpoints.
* `/frontend` — React workspace containing pages, components, context, and global stylesheets.

---

## 🚀 Backend Setup & Run Instructions

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Configure Virtual Environment & Install Dependencies
From the `/backend` directory, set up your environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 3. Run Migrations & Setup Admin Account
Set up database tables and recreate the default administrator:
```bash
# Apply database migrations
python manage.py migrate

# Create default superuser (Interactive)
python manage.py createsuperuser
```
*(Default project administrator account configured: Username `admin`, Password `admin`)*

### 4. Run Development Server
Start the Django development server:
```bash
python manage.py runserver 127.0.0.1:8000
```
The REST API is now hosted at: `http://127.0.0.1:8000/`

### 5. Running Automated Backend Tests
To run the suite of 15 API unit tests (covering permissions, comments, and admin restrictions):
```bash
python manage.py test
```

---

## 💻 Frontend Setup & Run Instructions

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
From the `/frontend` directory:
```bash
npm install
```

### 3. Run Frontend Server
Launch the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:5174/`

---

## 🔒 User & Admin Access Rules

### Standard Users (Frontend Platform)
* Standard users log in via the frontend login screen to write articles, edit their posts, view bento analytics, and post comments.
* Self-registration is disabled. Users can only be created by an administrator in the Admin Portal.

### Administrators (Back-Office Only)
* **API Restriction**: Administrators (`admin` superuser or staff) are restricted from logging in to the frontend application and from creating posts via the REST API (HTTP 403 Forbidden).
* **Django Admin Portal**: Administrators manage the system exclusively through the Django admin interface:
  * URL: `http://127.0.0.1:8000/admin/`
  * Action: Add/remove standard users, edit user details, block logins (unchecking `active` status), or reset passwords.
