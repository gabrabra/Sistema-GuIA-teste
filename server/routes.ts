import { Router } from 'express';
import { pool } from './db.js';

export const apiRouter = Router();

// --- Auth ---
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && user.password_hash === password) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          roleId: user.role_id
        } 
      });
    } else {
      res.status(401).json({ error: 'Email ou senha inválidos' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// --- Roles ---
apiRouter.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

apiRouter.post('/roles', async (req, res) => {
  const { id, name, permissions } = req.body;
  try {
    await pool.query(
      `INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
      [id, name, JSON.stringify(permissions || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

apiRouter.put('/roles/:id', async (req, res) => {
  const { name, permissions } = req.body;
  try {
    await pool.query(
      `UPDATE roles SET name = $1, permissions = $2 WHERE id = $3`,
      [name, JSON.stringify(permissions || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

apiRouter.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// --- Users ---
apiRouter.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role_id as "roleId", status, created_at as "createdAt" FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

apiRouter.post('/users', async (req, res) => {
  const { id, name, email, roleId, status, createdAt } = req.body;
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role_id, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, email, 'placeholder_hash', roleId, status, createdAt || new Date().toISOString()]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to create user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

apiRouter.put('/users/:id', async (req, res) => {
  const { name, email, roleId, status } = req.body;
  try {
    await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, role_id = $3, status = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [name, email, roleId, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Prompts ---
apiRouter.get('/prompts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompts');
    const prompts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      iconName: row.icon_name,
      iconColor: row.icon_color,
      color: row.color,
      category: row.category,
      isCustom: row.is_custom
    }));
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

apiRouter.post('/prompts', async (req, res) => {
  const { id, title, description, iconName, iconColor, color, category, isCustom } = req.body;
  try {
    await pool.query(
      `INSERT INTO prompts (id, title, description, icon_name, icon_color, color, category, is_custom) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, iconName, iconColor, color, category, isCustom]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

apiRouter.put('/prompts/:id', async (req, res) => {
  const { title, description, iconName, iconColor, color, category, isCustom } = req.body;
  try {
    await pool.query(
      `UPDATE prompts 
       SET title = $1, description = $2, icon_name = $3, icon_color = $4, color = $5, category = $6, is_custom = $7
       WHERE id = $8`,
      [title, description, iconName, iconColor, color, category, isCustom, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

apiRouter.delete('/prompts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM prompts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// --- Materias ---
apiRouter.get('/materias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materias');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materias' });
  }
});

apiRouter.post('/materias', async (req, res) => {
  const { id, nome, assuntos } = req.body;
  try {
    await pool.query(
      'INSERT INTO materias (id, nome, assuntos) VALUES ($1, $2, $3)',
      [id, nome, JSON.stringify(assuntos || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create materia' });
  }
});

apiRouter.put('/materias/:id', async (req, res) => {
  const { nome, assuntos } = req.body;
  try {
    await pool.query(
      'UPDATE materias SET nome = $1, assuntos = $2 WHERE id = $3',
      [nome, JSON.stringify(assuntos || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update materia' });
  }
});

apiRouter.delete('/materias/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM materias WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete materia' });
  }
});

// --- Disciplinas ---
apiRouter.get('/disciplinas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM disciplinas');
    const disciplinas = result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      peso: parseFloat(row.peso),
      horasSemanaMeta: parseFloat(row.horas_semana_meta),
      horasEstudadasTotal: parseFloat(row.horas_estudadas_total),
      horasEstudadasHoje: parseFloat(row.horas_estudadas_hoje),
      concluida: row.concluida,
      materiaId: row.materia_id,
      historico: row.historico
    }));
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disciplinas' });
  }
});

apiRouter.post('/disciplinas', async (req, res) => {
  const { id, nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, historico } = req.body;
  try {
    await pool.query(
      `INSERT INTO disciplinas (id, nome, peso, horas_semana_meta, horas_estudadas_total, horas_estudadas_hoje, concluida, materia_id, historico) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, nome, peso || 1, horasSemanaMeta || 0, horasEstudadasTotal || 0, horasEstudadasHoje || 0, concluida || false, materiaId, JSON.stringify(historico || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create disciplina' });
  }
});

apiRouter.put('/disciplinas/:id', async (req, res) => {
  const { nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, historico } = req.body;
  try {
    await pool.query(
      `UPDATE disciplinas 
       SET nome = $1, peso = $2, horas_semana_meta = $3, horas_estudadas_total = $4, horas_estudadas_hoje = $5, concluida = $6, materia_id = $7, historico = $8
       WHERE id = $9`,
      [nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, JSON.stringify(historico || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update disciplina' });
  }
});

apiRouter.delete('/disciplinas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM disciplinas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete disciplina' });
  }
});

// --- Produtos ---
apiRouter.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos');
    const produtos = result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price)
    }));
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch produtos' });
  }
});

apiRouter.post('/produtos', async (req, res) => {
  const { id, name, description, type, price, image, url, features } = req.body;
  try {
    await pool.query(
      'INSERT INTO produtos (id, name, description, type, price, image, url, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name, description, type, price, image, url, JSON.stringify(features || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create produto' });
  }
});

apiRouter.put('/produtos/:id', async (req, res) => {
  const { name, description, type, price, image, url, features } = req.body;
  try {
    await pool.query(
      'UPDATE produtos SET name = $1, description = $2, type = $3, price = $4, image = $5, url = $6, features = $7 WHERE id = $8',
      [name, description, type, price, image, url, JSON.stringify(features || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update produto' });
  }
});

apiRouter.delete('/produtos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete produto' });
  }
});

// --- Roles ---
apiRouter.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

apiRouter.post('/roles', async (req, res) => {
  const { id, name, permissions } = req.body;
  try {
    await pool.query(
      'INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3)',
      [id, name, JSON.stringify(permissions || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

apiRouter.put('/roles/:id', async (req, res) => {
  const { name, permissions } = req.body;
  try {
    await pool.query(
      'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3',
      [name, JSON.stringify(permissions || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

apiRouter.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});
