# ⏳ Digital Time Capsule

A full-stack web application to seal your memories, messages, and media until a future date.

## 🌟 Features

- **Authentication**: Register, login, JWT, password reset via email
- **Create Capsules**: Title, description, message, media upload (Cloudinary), unlock date
- **Lock System**: Capsules are permanently locked until the unlock date
- **Countdown Timer**: Live countdown with progress bar
- **Multiple Capsules**: Dashboard with all capsules and filter tabs
- **Email Notifications**: 3-day reminders + unlock notifications via Nodemailer
- **Future Recipients**: Add emails to notify when capsule unlocks
- **Shareable Links**: Secure token-based link with 30-day expiry
- **Scheduled Messages**: Schedule an email to any address for a future date
- **Dark Mode**: Full dark/light mode toggle
- **Responsive**: Works on mobile, tablet, and desktop

---

## 🗂 Project Structure

```
digital-time-capsule/
├── client/                  # React.js Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth & Theme context
│   │   ├── pages/           # Route pages
│   │   ├── utils/           # API utility
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                  # Node.js Backend
│   ├── config/              # DB & Cloudinary setup
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── utils/               # Email & Cron jobs
│   ├── index.js
│   └── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (App Password for Nodemailer)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# server/.env  (copy from .env.example)
cp server/.env.example server/.env
```

Fill in the values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital-time-capsule
JWT_SECRET=your_very_long_random_secret_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password    # Gmail App Password (not regular password)
EMAIL_FROM=Digital Time Capsule <your@gmail.com>

CLIENT_URL=http://localhost:5173
```

**Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate.

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Open http://localhost:5173

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Capsules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/capsules` | Get all capsules |
| POST | `/api/capsules` | Create capsule (multipart) |
| GET | `/api/capsules/:id` | Get single capsule |
| DELETE | `/api/capsules/:id` | Delete capsule |
| GET | `/api/capsules/share/:token` | Public shared view |
| POST | `/api/capsules/:id/regenerate-token` | New share token |

### Scheduled Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scheduled-messages` | Get all messages |
| POST | `/api/scheduled-messages` | Schedule new message |
| DELETE | `/api/scheduled-messages/:id` | Delete pending message |

---

## 🚢 Deployment

### Backend (Railway / Render)

1. Create a new service
2. Connect your GitHub repo
3. Set root directory to `server`
4. Add all environment variables
5. Set start command: `node index.js`

### Frontend (Vercel / Netlify)

1. Create new project
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

**Update `client/src/utils/api.js`** for production:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

### MongoDB Atlas
1. Create cluster at mongodb.com
2. Add your IP to the allowlist
3. Copy connection string to `MONGO_URI`

---

## ⏰ Cron Jobs

| Schedule | Task |
|----------|------|
| Every day at 9:00 AM | Send reminder if capsule unlocks in 3 days |
| Every hour | Check for newly unlocked capsules, notify recipients |
| Every hour at :30 | Deliver scheduled messages that are due |

---

## 🔒 Security

- JWT authentication with expiry
- bcryptjs password hashing (salt 12)
- Protected API routes via middleware
- Cloudinary secure URL generation
- Password reset tokens (SHA-256 hashed, 1-hour expiry)
- Share token randomness (32 bytes = 256-bit entropy)
