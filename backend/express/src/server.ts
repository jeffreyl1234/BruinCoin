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
import uploadRouter from './routes/upload';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for mobile app development
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
      offers: '/api/offers',
      upload: '/api/upload'
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
app.use('/api/upload', uploadRouter);

// Start server
const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 BruinCoin API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`📱 Mobile app can connect via your local IP address`);
});


