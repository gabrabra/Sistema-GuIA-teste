import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { apiRouter } from './server/routes.js';
import { initDb } from './server/db.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB
  let lastDbError: any = null;
  try {
    await initDb();
  } catch (err) {
    lastDbError = err;
    console.error('Failed to initialize database connection:', err);
  }

  // API Routes
  app.use('/api', apiRouter);

  app.get('/api/debug/db-status', (req, res) => {
    res.json({
      connected: !lastDbError,
      error: lastDbError ? (lastDbError instanceof Error ? lastDbError.message : String(lastDbError)) : null,
      stack: lastDbError ? (lastDbError instanceof Error ? lastDbError.stack : null) : null
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
