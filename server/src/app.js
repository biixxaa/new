import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import db from './db/index.js';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Let Vite & Google Fonts load freely
}));

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
}));

// Request parsing & logging
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    society: 'Illuminati Membership',
    database: db.isUsingPostgres() ? 'PostgreSQL' : 'Embedded Relational Fallback',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/admin', adminRoutes);

// Public Contact Form
app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, contactVector, subject, message } = req.body;
    console.log(`📜 [Communion Received] From: ${name} (${contactVector}) | Subject: ${subject}`);
    
    // Log to audit table
    await db.query(
      `INSERT INTO audit_logs (action, target_type, details) VALUES ($1, $2, $3)`,
      ['CONTACT_COMMUNIQUE', 'inquiry', JSON.stringify({ name, contactVector, subject, message: message?.slice(0, 200) })]
    );

    res.json({
      success: true,
      message: 'Communique cryptographically sealed and received by the Grand Scribe.',
    });
  } catch (err) {
    next(err);
  }
});

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'The requested sanctum portal does not exist.' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

