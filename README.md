# JOEAILABS — Full-Stack MVP

**Founder:** Joakim Ngiciri (Joetechie)  
**Stack:** React + Node/Express + MongoDB  
**Version:** 1.0.0

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **MongoDB** running locally → [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- A terminal

---

### Step 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal tab)
cd frontend
npm install
```

---

### Step 2 — Configure environment

The backend `.env` file is already created with sensible defaults:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/joeailabs
JWT_SECRET=joeailabs_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

⚠️ **Change `JWT_SECRET` before deploying to production.**

---

### Step 3 — Seed the database

```bash
cd backend
npm run seed
```

This creates:
- ✅ 6 learning modules
- ✅ 7 lessons with full content
- ✅ 30 prompt templates across 10+ categories
- ✅ Admin account: `admin@joeailabs.com` / `joeailabs2024`
- ✅ Demo account: `demo@joeailabs.com` / `demo1234`

---

### Step 4 — Start the servers

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

Open **http://localhost:5173** and log in with the demo account.

---

## 📁 Project Structure

```
joeailabs/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── .env               # Environment variables
│   ├── models/
│   │   ├── User.js        # User schema with progress tracking
│   │   ├── Module.js      # Learning module schema
│   │   ├── Lesson.js      # Lesson schema with content
│   │   └── Prompt.js      # AI prompt library schema
│   ├── routes/
│   │   ├── auth.js        # POST /register, /login, GET /me
│   │   ├── modules.js     # GET /modules, /modules/:id
│   │   ├── lessons.js     # GET /lessons/:id, POST /complete
│   │   ├── progress.js    # GET /progress (full summary)
│   │   ├── prompts.js     # GET /prompts (search/filter), POST /copy
│   │   └── dashboard.js   # GET /dashboard (aggregated)
│   ├── middleware/
│   │   └── auth.js        # JWT protect, adminOnly, generateToken
│   └── data/
│       └── seed.js        # Database seeder
│
└── frontend/
    ├── index.html
    ├── vite.config.js     # Proxies /api → localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx         # Router + all routes
        ├── styles/
        │   └── global.css  # Cyberpunk theme + all components
        ├── context/
        │   └── AuthContext.jsx   # Global auth state (JWT + localStorage)
        ├── hooks/
        │   └── index.js          # useFetch, useToast
        ├── services/
        │   └── api.js            # Axios instance + all API methods
        ├── components/
        │   ├── ui/index.jsx      # Spinner, Alert, Modal, StatCard, etc.
        │   └── layout/Navbar.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── auth/AuthPages.jsx      # Login + Register
            ├── dashboard/DashboardPage.jsx
            ├── modules/
            │   ├── ModulesPage.jsx     # Module list + Module detail
            │   └── LessonPage.jsx      # Lesson viewer + complete button
            └── prompts/PromptsPage.jsx # Search, filter, copy prompts
```

---

## 🔑 API Reference

### Auth
| Method | Endpoint           | Auth | Description         |
|--------|-------------------|------|---------------------|
| POST   | /api/auth/register | ❌   | Register new user   |
| POST   | /api/auth/login    | ❌   | Login, returns JWT  |
| GET    | /api/auth/me       | ✅   | Get current user    |
| PUT    | /api/auth/profile  | ✅   | Update profile      |

### Modules & Lessons
| Method | Endpoint                   | Auth | Description             |
|--------|---------------------------|------|-------------------------|
| GET    | /api/modules               | ✅   | All modules + progress  |
| GET    | /api/modules/:id           | ✅   | Module + its lessons    |
| GET    | /api/lessons/:id           | ✅   | Single lesson           |
| POST   | /api/lessons/:id/complete  | ✅   | Mark lesson complete    |

### Progress & Dashboard
| Method | Endpoint        | Auth | Description              |
|--------|----------------|------|--------------------------|
| GET    | /api/progress  | ✅   | Full progress summary    |
| GET    | /api/dashboard | ✅   | Dashboard aggregate data |

### Prompts
| Method | Endpoint               | Auth | Description            |
|--------|------------------------|------|------------------------|
| GET    | /api/prompts           | ✅   | List/search prompts    |
| GET    | /api/prompts/:id       | ✅   | Single prompt          |
| POST   | /api/prompts/:id/copy  | ✅   | Increment copy counter |

**Prompt query params:** `search`, `category`, `difficulty`, `tag`, `page`, `limit`

---

## 🎨 Design System

The entire theme is defined in `frontend/src/styles/global.css`:

```css
--bg-void:    #020508   /* Page background */
--bg-dark:    #050b14   /* Sections */
--bg-card:    #080f1d   /* Card backgrounds */
--neon-green: #00ffa3   /* Primary accent (JOE) */
--neon-yellow:#ffd600   /* Secondary accent (LABS) */
--neon-blue:  #00d4ff   /* Info/progress */
--neon-red:   #ff3c5a   /* Errors/danger */
```

**Fonts:**
- `Orbitron` — headings, buttons, labels (cyberpunk display)
- `Rajdhani` — body text (clean, technical)
- `Share Tech Mono` — code, prompts (terminal feel)

---

## 🔐 Premium / Locked Modules

Modules 4–6 are marked `isPremium: true` in the database. They are **locked by default** for all users with `isPremium: false`.

**To unlock for a user (development):**

1. Open MongoDB Compass or shell
2. Find the user in the `users` collection
3. Set `isPremium: true`

**To unlock yourself via the admin account:**
The admin user (`admin@joeailabs.com`) bypasses all premium locks.

---

## 🛠️ Adding More Content

### Add a new lesson to a module:
```javascript
// backend/data/seed.js — add to LESSONS_DATA array
{
  moduleOrder: 2,  // which module (1-6)
  order: 4,        // position within module
  title: 'Your Lesson Title',
  duration: 15,    // minutes
  summary: 'One-line description',
  content: `# Your markdown content here`,
  tips: ['Tip one', 'Tip two'],
  keyTakeaways: ['Takeaway one', 'Takeaway two'],
}
```
Then run `npm run seed` again (this will reset and re-seed).

### Add a new prompt:
```javascript
// backend/data/seed.js — add to PROMPTS_DATA array
{
  promptId: 'CAT_XXX',
  category: 'Your Category',
  subcategory: 'Subcategory',
  title: 'Prompt Title',
  difficulty: 'beginner',  // beginner | intermediate | advanced
  estimatedTime: '10 min',
  tags: ['tag1', 'tag2'],
  description: 'What this prompt does',
  promptText: `Your full prompt template here with [placeholders]`,
  placeholders: ['[placeholder1]', '[placeholder2]'],
}
```

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify):
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```
Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`

### Backend (Railway / Render / VPS):
1. Set `NODE_ENV=production`
2. Set `MONGODB_URI` to your MongoDB Atlas connection string
3. Set a strong `JWT_SECRET`
4. Run `node server.js`

### MongoDB (Production):
Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier.

---

## 📋 Next Steps for Development

- [ ] Add more lessons to each module (currently 1–3 per module)
- [ ] Import all 226 prompts from the PDF
- [ ] Add user profile page
- [ ] Add payment integration (Stripe) for premium unlock
- [ ] Add community/social features
- [ ] Add AI tools directory
- [ ] Add marketplace for services
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Add admin panel for content management

---

**JOEAILABS © 2024 Joakim Ngiciri. Built with 🔥**
