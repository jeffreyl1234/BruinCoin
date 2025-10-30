import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import tradesRouter from './routes/trades';
import messagesRouter from './routes/messages';
import conversationsRouter from './routes/conversations';

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
      users: '/api/users/:id',
      trades: '/api/trades',
      messages: '/api/messages',
      conversations: '/api/conversations'
    }
  });
});

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/conversations', conversationsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BruinCoin API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});


