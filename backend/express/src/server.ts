import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import tradesRouter from './routes/trades';
import messagesRouter from './routes/messages';
import conversationsRouter from './routes/conversations';
import lookingForRouter from './routes/lookingFor';
import ratingsRouter from './routes/ratings';
import offersRouter from './routes/offers';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BruinCoin API is running!',
    timestamp: new Date().toISOString()
  });
});

// Basic API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to BruinCoin API!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      trades: '/api/trades',
      messages: '/api/messages',
      conversations: '/api/conversations',
      lookingFor: '/api/looking-for',
      ratings: '/api/ratings',
      offers: '/api/offers'
    }
  });
});

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/looking-for', lookingForRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/offers', offersRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BruinCoin API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});


