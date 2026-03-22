import { Router } from 'express';
import { pool } from './db.js';
import { runWorkflow } from './agents/guiaResponde.js';
import { runWorkflow as runRedigeWorkflow } from './agents/guiaRedige.js';

export const apiRouter = Router();

// --- AI Agents ---
apiRouter.post('/responde', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const response = await runWorkflow({ input_as_text: message });
    res.json({ response });
  } catch (err) {
    console.error('Error in /responde:', err);
    res.status(500).json({ error: 'Failed to process request', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/redige', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const response = await runRedigeWorkflow({ input_as_text: message });
    res.json({ response });
  } catch (err) {
    console.error('Error in /redige:', err);
    res.status(500).json({ error: 'Failed to process request', details: err instanceof Error ? err.message : String(err) });
  }
});

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
    console.error('Error in /auth/login:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- User Settings ---
apiRouter.get('/user-settings', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        userId,
        theme: 'white',
        themeIntensity: 'medium',
        menuVisibility: {},
        dashboardLayout: [],
        concursoObjetivo: null,
        preferences: {}
      });
    }
    const row = result.rows[0];
    res.json({
      userId: row.user_id,
      theme: row.theme,
      themeIntensity: row.theme_intensity,
      menuVisibility: row.menu_visibility,
      dashboardLayout: row.dashboard_layout,
      concursoObjetivo: row.concurso_objetivo,
      preferences: row.preferences
    });
  } catch (err) {
    console.error('Error in GET /user-settings:', err);
    res.status(500).json({ error: 'Failed to fetch user settings', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/user-settings', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { theme, themeIntensity, menuVisibility, dashboardLayout, concursoObjetivo, preferences } = req.body;
  try {
    await pool.query(
      `INSERT INTO user_settings (user_id, theme, theme_intensity, menu_visibility, dashboard_layout, concurso_objetivo, preferences)
       VALUES ($1, COALESCE($2, 'white'), COALESCE($3, 'medium'), COALESCE($4, '{}'::jsonb), COALESCE($5, '[]'::jsonb), $6, COALESCE($7, '{}'::jsonb))
       ON CONFLICT (user_id) DO UPDATE SET
         theme = COALESCE($2, user_settings.theme),
         theme_intensity = COALESCE($3, user_settings.theme_intensity),
         menu_visibility = COALESCE($4, user_settings.menu_visibility),
         dashboard_layout = COALESCE($5, user_settings.dashboard_layout),
         concurso_objetivo = COALESCE($6, user_settings.concurso_objetivo),
         preferences = COALESCE($7, user_settings.preferences)`,
      [
        userId, 
        theme !== undefined ? theme : null, 
        themeIntensity !== undefined ? themeIntensity : null, 
        menuVisibility !== undefined ? JSON.stringify(menuVisibility) : null, 
        dashboardLayout !== undefined ? JSON.stringify(dashboardLayout) : null,
        concursoObjetivo !== undefined ? concursoObjetivo : null,
        preferences !== undefined ? JSON.stringify(preferences) : null
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /user-settings:', err);
    res.status(500).json({ error: 'Failed to update user settings', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Roles ---
apiRouter.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles', details: err instanceof Error ? err.message : String(err) });
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
    console.error('Error in POST /roles:', err);
    res.status(500).json({ error: 'Failed to create role', details: err instanceof Error ? err.message : String(err) });
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
    console.error('Error in PUT /roles/:id:', err);
    res.status(500).json({ error: 'Failed to update role', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /roles/:id:', err);
    res.status(500).json({ error: 'Failed to delete role', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Users ---
apiRouter.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role_id as "roleId", status, created_at as "createdAt", ai_profile_id as "aiProfileId" FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/users', async (req, res) => {
  const { id, name, email, roleId, status, createdAt, aiProfileId } = req.body;
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role_id, status, created_at, ai_profile_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name, email, 'placeholder_hash', roleId, status, createdAt || new Date().toISOString(), aiProfileId || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /users:', err);
    res.status(500).json({ error: 'Failed to create user', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/users/:id', async (req, res) => {
  const { name, email, roleId, status, aiProfileId } = req.body;
  try {
    await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, role_id = $3, status = $4, updated_at = CURRENT_TIMESTAMP, ai_profile_id = $5
       WHERE id = $6`,
      [name, email, roleId, status, aiProfileId || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /users/:id:', err);
    res.status(500).json({ error: 'Failed to update user', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /users/:id:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/users/:id/reset', async (req, res) => {
  const userId = req.params.id;
  try {
    // Delete all study-related data for the user
    await pool.query('DELETE FROM study_sessions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM disciplinas WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM materias WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM concursos WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_settings WHERE user_id = $1', [userId]);
    
    res.json({ success: true, message: 'User account reset successfully' });
  } catch (err) {
    console.error('Error in POST /users/:id/reset:', err);
    res.status(500).json({ error: 'Failed to reset user account', details: err instanceof Error ? err.message : String(err) });
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
      promptContent: row.prompt_content,
      iconName: row.icon_name,
      iconColor: row.icon_color,
      color: row.color,
      category: row.category,
      isCustom: row.is_custom
    }));
    res.json(prompts);
  } catch (err) {
    console.error('Error in GET /prompts:', err);
    res.status(500).json({ error: 'Failed to fetch prompts', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/prompts', async (req, res) => {
  const { id, title, description, promptContent, iconName, iconColor, color, category, isCustom } = req.body;
  try {
    await pool.query(
      `INSERT INTO prompts (id, title, description, prompt_content, icon_name, icon_color, color, category, is_custom) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, description, promptContent, iconName, iconColor, color, category, isCustom]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /prompts:', err);
    res.status(500).json({ error: 'Failed to create prompt', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/prompts/:id', async (req, res) => {
  const { title, description, promptContent, iconName, iconColor, color, category, isCustom } = req.body;
  try {
    await pool.query(
      `UPDATE prompts 
       SET title = $1, description = $2, prompt_content = $3, icon_name = $4, icon_color = $5, color = $6, category = $7, is_custom = $8
       WHERE id = $9`,
      [title, description, promptContent, iconName, iconColor, color, category, isCustom, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /prompts/:id:', err);
    res.status(500).json({ error: 'Failed to update prompt', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/prompts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM prompts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /prompts/:id:', err);
    res.status(500).json({ error: 'Failed to delete prompt', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Concursos ---
apiRouter.get('/concursos', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    const result = await pool.query('SELECT * FROM concursos WHERE user_id = $1', [userId]);
    res.json(result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      orgao: row.orgao || '',
      nome: row.nome,
      possuiEdital: row.possui_edital,
      dataProva: row.data_prova ? new Date(row.data_prova).toISOString().split('T')[0] : null,
      horasSemanaMeta: parseFloat(row.horas_semana_meta || '0'),
      diasDisponiveis: row.dias_disponiveis || []
    })));
  } catch (err) {
    console.error('Error in GET /concursos:', err);
    res.status(500).json({ error: 'Failed to fetch concursos', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/concursos', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id, orgao, nome, possuiEdital, dataProva, horasSemanaMeta, diasDisponiveis } = req.body;
  console.log('POST /concursos received:', { id, userId, orgao, nome, possuiEdital, dataProva, horasSemanaMeta, diasDisponiveis });
  try {
    await pool.query(
      `INSERT INTO concursos (id, user_id, orgao, nome, possui_edital, data_prova, horas_semana_meta, dias_disponiveis) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         orgao = EXCLUDED.orgao,
         nome = EXCLUDED.nome,
         possui_edital = EXCLUDED.possui_edital,
         data_prova = EXCLUDED.data_prova,
         horas_semana_meta = EXCLUDED.horas_semana_meta,
         dias_disponiveis = EXCLUDED.dias_disponiveis`,
      [id, userId, orgao, nome, possuiEdital, dataProva, horasSemanaMeta || 0, JSON.stringify(diasDisponiveis || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /concursos:', err);
    res.status(500).json({ error: 'Failed to create/update concurso', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/concursos/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    await pool.query('DELETE FROM concursos WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    // Also delete associated disciplinas to start fresh, but KEEP materias
    await pool.query('DELETE FROM disciplinas WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /concursos/:id:', err);
    res.status(500).json({ error: 'Failed to delete concurso', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Materias ---
apiRouter.get('/materias', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    const result = await pool.query('SELECT * FROM materias WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /materias:', err);
    res.status(500).json({ error: 'Failed to fetch materias', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/materias', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id, nome, assuntos } = req.body;
  try {
    await pool.query(
      'INSERT INTO materias (id, user_id, nome, assuntos) VALUES ($1, $2, $3, $4)',
      [id, userId, nome, JSON.stringify(assuntos || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /materias:', err);
    res.status(500).json({ error: 'Failed to create materia', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/materias/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { nome, assuntos } = req.body;
  try {
    await pool.query(
      'UPDATE materias SET nome = $1, assuntos = $2 WHERE id = $3 AND user_id = $4',
      [nome, JSON.stringify(assuntos || []), req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /materias/:id:', err);
    res.status(500).json({ error: 'Failed to update materia', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/materias/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    await pool.query('DELETE FROM materias WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /materias/:id:', err);
    res.status(500).json({ error: 'Failed to delete materia', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Disciplinas ---
apiRouter.get('/disciplinas', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    const result = await pool.query('SELECT * FROM disciplinas WHERE user_id = $1', [userId]);
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
    console.error('Error in GET /disciplinas:', err);
    res.status(500).json({ error: 'Failed to fetch disciplinas', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/disciplinas', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id, nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, historico } = req.body;
  try {
    await pool.query(
      `INSERT INTO disciplinas (id, user_id, nome, peso, horas_semana_meta, horas_estudadas_total, horas_estudadas_hoje, concluida, materia_id, historico) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, userId, nome, peso || 1, horasSemanaMeta || 0, horasEstudadasTotal || 0, horasEstudadasHoje || 0, concluida || false, materiaId, JSON.stringify(historico || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /disciplinas:', err);
    res.status(500).json({ error: 'Failed to create disciplina', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/disciplinas/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, historico } = req.body;
  try {
    await pool.query(
      `UPDATE disciplinas 
       SET nome = $1, peso = $2, horas_semana_meta = $3, horas_estudadas_total = $4, horas_estudadas_hoje = $5, concluida = $6, materia_id = $7, historico = $8
       WHERE id = $9 AND user_id = $10`,
      [nome, peso, horasSemanaMeta, horasEstudadasTotal, horasEstudadasHoje, concluida, materiaId, JSON.stringify(historico || []), req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /disciplinas/:id:', err);
    res.status(500).json({ error: 'Failed to update disciplina', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/disciplinas/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    await pool.query('DELETE FROM disciplinas WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /disciplinas/:id:', err);
    res.status(500).json({ error: 'Failed to delete disciplina', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- AI Profiles ---
apiRouter.get('/ai-profiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_profiles ORDER BY created_at ASC');
    const profiles = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      responde: {
        promptsPerDay: row.responde_prompts_per_day,
        maxCharactersPerPrompt: row.responde_max_chars
      },
      redige: {
        promptsPerDay: row.redige_prompts_per_day,
        maxCharactersPerPrompt: row.redige_max_chars
      }
    }));
    res.json(profiles);
  } catch (err) {
    console.error('Error in GET /ai-profiles:', err);
    res.status(500).json({ error: 'Failed to fetch AI profiles', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/ai-profiles', async (req, res) => {
  const { id, name, responde, redige } = req.body;
  try {
    await pool.query(
      `INSERT INTO ai_profiles (id, name, responde_prompts_per_day, responde_max_chars, redige_prompts_per_day, redige_max_chars)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id, 
        name, 
        responde?.promptsPerDay || 10, 
        responde?.maxCharactersPerPrompt || 500,
        redige?.promptsPerDay || 5,
        redige?.maxCharactersPerPrompt || 1000
      ]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /ai-profiles:', err);
    res.status(500).json({ error: 'Failed to create AI profile', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/ai-profiles/:id', async (req, res) => {
  const { name, responde, redige } = req.body;
  try {
    await pool.query(
      `UPDATE ai_profiles 
       SET name = $1, responde_prompts_per_day = $2, responde_max_chars = $3, redige_prompts_per_day = $4, redige_max_chars = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        name,
        responde?.promptsPerDay || 10, 
        responde?.maxCharactersPerPrompt || 500,
        redige?.promptsPerDay || 5,
        redige?.maxCharactersPerPrompt || 1000,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /ai-profiles/:id:', err);
    res.status(500).json({ error: 'Failed to update AI profile', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/ai-profiles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_profiles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /ai-profiles/:id:', err);
    res.status(500).json({ error: 'Failed to delete AI profile', details: err instanceof Error ? err.message : String(err) });
  }
});

// --- Motivational Phrases ---
apiRouter.get('/motivational-phrases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM motivational_phrases ORDER BY created_at DESC');
    const phrases = result.rows.map(row => ({
      id: row.id,
      phrase: row.phrase,
      author: row.author,
      showDate: row.show_date ? new Date(row.show_date).toISOString().split('T')[0] : null,
      style: row.style || {},
      createdAt: row.created_at
    }));
    res.json(phrases);
  } catch (err) {
    console.error('Error in GET /motivational-phrases:', err);
    res.status(500).json({ error: 'Failed to fetch motivational phrases', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/motivational-phrases', async (req, res) => {
  const { id, phrase, author, showDate, style } = req.body;
  try {
    await pool.query(
      `INSERT INTO motivational_phrases (id, phrase, author, show_date, style) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, phrase, author, showDate || null, style || {}]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error in POST /motivational-phrases:', err);
    res.status(500).json({ error: 'Failed to create motivational phrase', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/motivational-phrases/bulk', async (req, res) => {
  const { phrases } = req.body;
  
  if (!Array.isArray(phrases)) {
    return res.status(400).json({ error: 'Expected an array of phrases' });
  }

  try {
    await pool.query('BEGIN');
    for (const p of phrases) {
      await pool.query(
        `INSERT INTO motivational_phrases (id, phrase, author, show_date, style) 
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.phrase, p.author || null, p.showDate || null, p.style || {}]
      );
    }
    await pool.query('COMMIT');
    res.status(201).json({ success: true, count: phrases.length });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error in POST /motivational-phrases/bulk:', err);
    res.status(500).json({ error: 'Failed to bulk create motivational phrases', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.put('/motivational-phrases/:id', async (req, res) => {
  const { phrase, author, showDate, style } = req.body;
  try {
    await pool.query(
      `UPDATE motivational_phrases 
       SET phrase = $1, author = $2, show_date = $3, style = $4
       WHERE id = $5`,
      [phrase, author, showDate || null, style || {}, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /motivational-phrases/:id:', err);
    res.status(500).json({ error: 'Failed to update motivational phrase', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/motivational-phrases/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM motivational_phrases WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /motivational-phrases/:id:', err);
    res.status(500).json({ error: 'Failed to delete motivational phrase', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos');
    const produtos = result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price)
    }));
    res.json(produtos);
  } catch (err) {
    console.error('Error in GET /produtos:', err);
    res.status(500).json({ error: 'Failed to fetch produtos', details: err instanceof Error ? err.message : String(err) });
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
    console.error('Error in POST /produtos:', err);
    res.status(500).json({ error: 'Failed to create produto', details: err instanceof Error ? err.message : String(err) });
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
    console.error('Error in PUT /produtos/:id:', err);
    res.status(500).json({ error: 'Failed to update produto', details: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.delete('/produtos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /produtos/:id:', err);
    res.status(500).json({ error: 'Failed to delete produto', details: err instanceof Error ? err.message : String(err) });
  }
});


