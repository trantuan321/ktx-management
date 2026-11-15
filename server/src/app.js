import express from 'express';
import cors from 'cors';
import { CLIENT_ORIGIN } from './config.js';
import { initSchema } from './db.js';
import { HttpError } from './errors.js';
import authRoutes from './routes/auth.js';
import buildingRoutes from './routes/buildings.js';
import roomRoutes from './routes/rooms.js';
import bedRoutes from './routes/beds.js';
import studentRoutes from './routes/students.js';
import applicationRoutes from './routes/applications.js';
import userRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';

export function createApp() {
  initSchema();

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'QLKTX API' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/buildings', buildingRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/beds', bedRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/stats', statsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API.' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, details: err.details });
    }
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Dữ liệu JSON không hợp lệ.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  });

  return app;
}
