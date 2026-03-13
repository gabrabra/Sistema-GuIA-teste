import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { apiRouter } from './server/routes.js';
import { initDb, pool } from './server/db.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Initialize DB
  try {
    await initDb();
  } catch (err) {
    console.error('Failed to initialize database connection:', err);
    console.log('Server will continue to start, but database operations will fail.');
  }

  // API Routes
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for ${email}`);
    try {
      const result = await pool.query(
        'SELECT id, name, email, role_id as "roleId", status FROM users WHERE email = $1 AND password_hash = $2 AND status = \'active\'',
        [email, password]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(`Login successful for ${email}`);
        res.json({ success: true, user });
      } else {
        console.log(`Login failed for ${email}: Invalid credentials`);
        res.status(401).json({ error: 'Email ou senha incorretos ou usuário inativo' });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });

  app.use('/api', apiRouter);

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
