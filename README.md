# LinkVault - Advanced URL Shortener & Analytics Platform


LinkVault is a complete, production-level full-stack web application built for modern engineering requirements. It transforms long URLs into clean, shareable short links, provides deep real-time analytics, and features a premium, responsive dashboard.

This project was built focusing on clean architecture, modular code, and real-world engineering practices.

## ✨ Key Features

### Authentication System
* **Secure Login & Registration**: Powered by JWT and bcryptjs.
* **Session Management**: Persistent login states and secure token handling.
* **Role-Based Access**: Scalable architecture ready for admin/user roles.

### Core URL Management
* **Instant Shortening**: Fast and collision-resistant unique ID generation (Nanoid).
* **Custom Aliases**: Branded custom slugs with validation to prevent duplicates.
* **Advanced Options**: Optional expiry dates and metadata (titles, tags).
* **QR Code Generation**: Automatically generated, downloadable QR codes.
* **Bulk Import**: Shorten up to 50 URLs instantly via CSV file upload.

### Analytics Engine
* **Real-time Tracking**: Captures timestamp, browser, OS, device type, and referrer.
* **Visual Dashboard**: Integrated with Recharts for beautiful data visualization.
* **Click Trends**: Interactive line charts for daily/weekly click traffic.
* **Data Export**: Export link data and analytics to CSV.

### Premium UI/UX
* **Modern Aesthetic**: Dark premium theme with glassmorphism effects.
* **Responsive Layout**: Seamless experience across Desktop, Tablet, and Mobile.
* **Animations**: Fluid transitions and micro-interactions powered by Framer Motion.
* **UX Feedback**: Comprehensive loading states, skeleton loaders, and toast notifications.

---

## 🛠 Tech Stack

**Frontend Architecture:**
* React.js (CRA setup)
* React Router DOM v6
* Context API (Global State Management)
* Axios (with centralized interceptors)
* Vanilla CSS (CSS Variables, Flexbox/Grid, Responsive Media Queries)
* Framer Motion (Animations)
* Recharts (Data Visualization)
* Lucide React (Icons)

**Backend Architecture:**
* Node.js & Express.js
* MongoDB Atlas & Mongoose (ODM)
* JWT (JSON Web Tokens)
* Bcryptjs (Password Hashing)
* Express-validator (Input Sanitization)
* Helmet & Morgan (Security and Logging)
* Express-rate-limit (API protection)

---

## 📂 Architecture & Folder Structure

The application follows the **MVC (Model-View-Controller)** pattern on the backend and a **Feature-based Component Architecture** on the frontend.

### Backend Structure (`/server`)
```
server/
├── config/           # Database and environment configurations
├── controllers/      # Business logic and request handling
├── middleware/       # Custom middleware (Auth, Error Handling, Rate Limiting)
├── models/           # Mongoose Database Schemas
├── routes/           # Express API Route definitions
├── utils/            # Helper functions (AsyncWrapper, Standardized Responses)
├── validators/       # Request validation schemas (Express-validator)
├── logs/             # Generated application logs (Winston)
├── uploads/          # Static file uploads (Profile Images, CSVs)
└── server.js         # Application entry point
```

### Frontend Structure (`/client`)
```
client/
├── src/
│   ├── components/   # Reusable UI components (Sidebar, Topbar, Modals)
│   ├── context/      # React Context API providers (AuthContext)
│   ├── layouts/      # Page layout wrappers (DashboardLayout)
│   ├── pages/        # Main application views
│   ├── services/     # API client configurations (Axios)
│   ├── styles/       # Global CSS design system and component styles
│   ├── App.js        # Main router configuration
│   └── index.js      # React DOM entry
```

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* Local MongoDB Server or MongoDB Compass

### 1. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Setup environment variables
# Copy the .env.example file to .env and configure it
cp .env.example .env

# Start the development server
npm run dev
```

**Required `.env` Variables for Server:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/linkvault
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:5000
```

### 2. Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```
The frontend will start at `http://localhost:3000` and communicate with the backend at `http://localhost:5000`.

---

## 📖 API Documentation

### Authentication Routes (`/api/auth`)
* `POST /register` - Register a new user
* `POST /login` - Authenticate user and get token
* `GET /profile` - Get logged-in user profile
* `PUT /password` - Update password

### URL Routes (`/api/url`)
* `POST /create` - Create a new short URL
* `POST /bulk` - Bulk create URLs via CSV upload
* `GET /all` - Get all URLs for the user (Paginated)
* `GET /stats` - Get aggregate dashboard statistics
* `GET /analytics/:shortCode` - Get deep analytics for a specific link
* `PUT /:id` - Update URL metadata (expiry, title, destination)
* `DELETE /:id` - Delete a URL
* `GET /export` - Export URL data to CSV

### Redirect Route (`/:shortCode`)
* `GET /:shortCode` - Redirects to original URL and logs the visit

---

## ☁️ Deployment Instructions

### Backend (Render/Railway)
1. Push the repository to GitHub.
2. Connect the repository to Render/Railway.
3. Set the root directory to `server`.
4. Add the required environment variables.
5. Deploy.

### Frontend (Vercel)
1. Import the repository in Vercel.
2. Set the root directory to `client`.
3. Add `REACT_APP_API_URL` environment variable pointing to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`).
4. Deploy.

---

## 🧠 Engineering Decisions & Challenges

### 1. Click Tracking Performance
**Challenge:** Tracking every single click synchronously before redirecting the user causes latency and degrades UX.
**Solution:** The redirect route (`GET /:shortCode`) sends the 301 redirect immediately, and dispatches the analytics recording asynchronously in the background (`url.recordVisit(visitInfo).catch(...)`). This ensures blazing fast redirects while preserving data accuracy.

### 2. High-Volume Analytics Storage
**Challenge:** Storing an array of thousands of visit objects per URL will hit MongoDB document size limits (16MB).
**Solution:** The database uses a hybrid approach. It maintains pre-calculated aggregates (Counters, Maps for Browsers/Devices/OS) for instant O(1) reads, and only keeps the last 1,000 raw visits in the history array using `$push` with `$slice` logic for recent visitor tables.

### 3. Collision Prevention
**Challenge:** Generating short codes requires uniqueness.
**Solution:** Utilized `nanoid` with a custom URL-safe alphabet, paired with a `while` loop fallback that checks against the database index. A unique index at the DB level serves as the ultimate safety net.

### 4. Modular Security
**Challenge:** Protecting API endpoints flexibly.
**Solution:** Developed custom middleware (`protect`, `restrictTo`) alongside `express-validator` and `helmet`. Implemented generic `asyncHandler` wrappers to centralize `try/catch` logic and feed errors into a global Error Handler.

---

## 🔮 Future Improvements

1. **Redis Caching**: Implement Redis to cache URL redirects and eliminate database queries for high-traffic links.
2. **GeoIP Resolution**: Integrate MaxMind or a similar service to convert visitor IPs into detailed Geographic data on the analytics dashboard.
3. **Team Workspaces**: Allow multiple users to share links and analytics within a unified company workspace.

---

> This project is a part of a hackathon run by https://katomaran.com
