# BruinCoin

A modern cryptocurrency application built with Next.js frontend and Node.js backend, powered by Supabase.

## 🏗️ Architecture

- **Frontend**: Next.js with v0 (deployed on Vercel)
- **Backend**: Node.js/Express API (deployed on Render)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Version Control**: Separate Git repositories with branch-based workflow

## 🌳 Git Workflow

This project uses **separate repositories** for frontend and backend, each with their own branch structure:

### Repository Structure
- `bruinCoin/frontend/` - Frontend repository (Next.js)
- `bruinCoin/backend/` - Backend repository (Node.js/Express)

### Branch Structure (for each repository)
- `main` - Production branch (stable, deployed code)
- `dev` - Development branch (integration branch for features)
- `feature/*` - Feature branches (cloned off `dev`)

### Workflow
1. Create feature branches from `dev` in the appropriate repository
2. Develop features in feature branches
3. Merge feature branches into `dev` for testing
4. Merge `dev` into `main` for production releases

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Git
- Supabase account
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Local Development

1. **Clone repositories**
   ```bash
   # Clone frontend repository
   git clone <frontend-repo-url>
   cd bruinCoin-frontend
   git checkout dev
   
   # Clone backend repository (in separate terminal/directory)
   git clone <backend-repo-url>
   cd bruinCoin-backend
   git checkout dev
   ```

2. **Backend Setup**
   ```bash
   cd bruinCoin-backend
   npm install
   cp .env.example .env
   # Fill in your Supabase credentials in .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd bruinCoin-frontend
   npm install
   cp .env.local.example .env.local
   # Fill in your Supabase credentials in .env.local
   npm run dev
   ```

## 📁 Project Structure

```
bruinCoin/
├── frontend/               # Frontend repository (Next.js)
│   ├── .git/              # Frontend git repository
│   ├── src/
│   │   ├── app/            # Next.js 13+ app directory
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # Global styles
│   ├── .env.local.example  # Environment variables template
│   ├── next.config.js
│   ├── package.json
│   └── README.md
├── backend/                # Backend repository (Node.js/Express)
│   ├── .git/              # Backend git repository
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   ├── server.js           # Entry point
│   └── README.md
└── README.md               # Main project documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🗄️ Database Schema (Supabase)

### Users Table
- `id` (uuid, primary key)
- `email` (text, unique)
- `username` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Wallets Table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `balance` (decimal)
- `currency` (text, default: 'BRUIN')
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Transactions Table
- `id` (uuid, primary key)
- `from_wallet_id` (uuid, foreign key)
- `to_wallet_id` (uuid, foreign key)
- `amount` (decimal)
- `type` (text: 'transfer', 'deposit', 'withdrawal')
- `status` (text: 'pending', 'completed', 'failed')
- `created_at` (timestamp)

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your **frontend** GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables in Vercel dashboard
5. Deploy from `main` branch

### Backend (Render)
1. Connect your **backend** GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy from `main` branch

## 🔒 Security Best Practices

- ✅ Environment variables properly separated (client vs server)
- ✅ Supabase RLS (Row Level Security) enabled
- ✅ API rate limiting implemented
- ✅ Input validation and sanitization
- ✅ CORS properly configured
- ✅ JWT tokens for authentication
- ✅ No secrets exposed in client-side code

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run linter
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Run linter
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Wallets
- `GET /api/wallets` - Get user wallets
- `POST /api/wallets` - Create new wallet
- `GET /api/wallets/:id` - Get specific wallet

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction

## 🤝 Contributing

### For Frontend Development
1. Navigate to frontend repository: `cd bruinCoin-frontend`
2. Create a feature branch from `dev`: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Create a pull request to `dev`
6. After review and testing, merge to `main` for production

### For Backend Development
1. Navigate to backend repository: `cd bruinCoin-backend`
2. Create a feature branch from `dev`: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Create a pull request to `dev`
6. After review and testing, merge to `main` for production

## 📄 License

MIT License - see LICENSE file for details
