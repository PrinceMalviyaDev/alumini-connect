import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import { connectDB } from '@/config/db';
import { initSocket } from '@/socket';
import { setIO } from '@/socket/instance';
import { errorHandler } from '@/middleware/error';

import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import alumniRoutes from '@/routes/alumni';
import studentRoutes from '@/routes/students';
import requestRoutes from '@/routes/requests';
import feedbackRoutes from '@/routes/feedback';
import notificationRoutes from '@/routes/notifications';
import leaderboardRoutes from '@/routes/leaderboard';
import adminRoutes from '@/routes/admin';

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrl.split(',').map((u) => u.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setIO(io);
initSocket(io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { io };
