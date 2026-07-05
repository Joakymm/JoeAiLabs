# JOEAILABS — Deployment Guide

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your real values
npm install
npm run dev         # http://localhost:5001
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Leave VITE_API_BASE_URL blank to use Vite proxy
npm install
npm run dev         # http://localhost:5173
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Serve with Node (Recommended)
Add to `backend/server.js` (already included):
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```

## Platform Deployment Options

### Render (Recommended — Free Tier)
1. Push to GitHub
2. Create a **Web Service** → select repo
3. Build Command: `cd frontend && npm install && npm run build`
4. Start Command: `cd backend && npm start`
5. Add all `.env` variables in Render dashboard

### Railway
1. Push to GitHub → connect Railway
2. Add environment variables
3. Railway auto-detects Node.js

### VPS (DigitalOcean / Hetzner)
```bash
# Clone repo on server
git clone <your-repo>
cd joeailabs/backend && npm install
cd ../frontend && npm install && npm run build

# Use PM2 for backend
npm install -g pm2
pm2 start backend/server.js --name joeailabs
pm2 save && pm2 startup

# Nginx reverse proxy
# proxy_pass http://localhost:5001;
```

## Environment Variables Checklist

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Strong random string (32+ chars) |
| `GEMINI_API_KEY` | ✅ | Google AI Studio key |
| `CLIENT_ORIGINS` | ✅ Prod | Comma-separated allowed origins |
| `BINANCE_API_KEY` | Optional | For crypto payments |
| `REDIS_URL` | Optional | Falls back to in-memory rate limiting |
| `NODE_ENV` | ✅ | Set to `production` |

## Seed Data
```bash
cd backend
npm run seed        # Populates modules, lessons, and prompts
```

## Post-Deploy Checks
- [ ] `/api/health` returns 200
- [ ] Login + Register flow works
- [ ] Module list loads
- [ ] Prompt library loads
- [ ] Admin panel accessible at `/admin` (role=admin user)
- [ ] Community links configured in Admin → Settings
- [ ] Theme toggle (dark/light) persists
