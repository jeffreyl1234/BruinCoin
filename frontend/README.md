# BruinCoin Frontend

Next.js frontend application for BruinCoin cryptocurrency platform.

## 🏗️ Tech Stack

- **Framework**: Next.js with v0
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🌳 Git Workflow

### Branch Structure
- `main` - Production branch (stable, deployed code)
- `dev` - Development branch (integration branch for features)
- `feature/*` - Feature branches (cloned off `dev`)

### Workflow
1. Create feature branches from `dev`
2. Develop features in feature branches
3. Merge feature branches into `dev` for testing
4. Merge `dev` into `main` for production releases

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Setup**
   ```bash
   git clone <frontend-repo-url>
   cd bruinCoin-frontend
   git checkout dev
   npm install
   cp .env.local.example .env.local
   # Fill in your Supabase credentials in .env.local
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/            # Next.js 13+ app directory
│   ├── components/     # Reusable components
│   ├── lib/            # Utility functions
│   └── styles/         # Global styles
├── .env.local.example  # Environment variables template
├── next.config.js
└── package.json
```

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables in Vercel dashboard
5. Deploy from `main` branch

## 🎨 Features

- User authentication (login/register)
- Wallet management
- Transaction history
- Real-time updates
- Responsive design
- Dark/light mode

## 🛠️ Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Run linter
```

## 📱 Pages

- `/` - Home/Dashboard
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/wallet` - Wallet management
- `/transactions` - Transaction history
- `/profile` - User profile
