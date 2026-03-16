import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://sistemaguiadm:973574BBA@evolution_sistema-guia-db:5432/sistema-guia-db?sslmode=disable'
});

export async function initDb(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS prompts (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          icon_name VARCHAR(100),
          icon_color VARCHAR(100),
          color VARCHAR(100),
          category VARCHAR(100),
          is_custom BOOLEAN DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS materias (
          id VARCHAR(255) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          assuntos JSONB DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS disciplinas (
          id VARCHAR(255) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          peso NUMERIC DEFAULT 1,
          horas_semana_meta NUMERIC DEFAULT 0,
          horas_estudadas_total NUMERIC DEFAULT 0,
          horas_estudadas_hoje NUMERIC DEFAULT 0,
          concluida BOOLEAN DEFAULT false,
          materia_id VARCHAR(255),
          historico JSONB DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS produtos (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(100),
          price NUMERIC(10, 2),
          image VARCHAR(255),
          url VARCHAR(255),
          features JSONB DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS roles (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          permissions JSONB DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS ai_profiles (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          responde_prompts_per_day INTEGER DEFAULT 10,
          responde_max_chars INTEGER DEFAULT 500,
          redige_prompts_per_day INTEGER DEFAULT 5,
          redige_max_chars INTEGER DEFAULT 1000,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role_id VARCHAR(255) REFERENCES roles(id),
          status VARCHAR(50) DEFAULT 'active',
          ai_profile_id VARCHAR(255) REFERENCES ai_profiles(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS permissions (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          module VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS role_permissions (
          role_id VARCHAR(255) REFERENCES roles(id) ON DELETE CASCADE,
          permission_id VARCHAR(255) REFERENCES permissions(id) ON DELETE CASCADE,
          PRIMARY KEY (role_id, permission_id)
        );

        CREATE TABLE IF NOT EXISTS user_roles (
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          role_id VARCHAR(255) REFERENCES roles(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, role_id)
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          plan_name VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          end_date TIMESTAMP WITH TIME ZONE,
          features JSONB DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS user_settings (
          user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          theme VARCHAR(50) DEFAULT 'white',
          theme_intensity VARCHAR(50) DEFAULT 'medium',
          menu_visibility JSONB DEFAULT '{}'::jsonb,
          dashboard_layout JSONB DEFAULT '[]'::jsonb,
          concurso_objetivo VARCHAR(255),
          preferences JSONB DEFAULT '{}'::jsonb
        );

        CREATE TABLE IF NOT EXISTS concursos (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          orgao VARCHAR(255),
          nome VARCHAR(255) NOT NULL,
          possui_edital BOOLEAN DEFAULT false,
          data_prova DATE
        );
        
        -- Add orgao column if it doesn't exist
        ALTER TABLE concursos ADD COLUMN IF NOT EXISTS orgao VARCHAR(255);

        CREATE TABLE IF NOT EXISTS study_sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          disciplina_id VARCHAR(255) REFERENCES disciplinas(id) ON DELETE CASCADE,
          assunto VARCHAR(255),
          data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          segundos INTEGER NOT NULL
        );

        -- Add user_id to existing tables for multi-tenancy
        ALTER TABLE prompts ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_content TEXT;
        ALTER TABLE materias ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE disciplinas ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE produtos ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE concursos ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        
        -- Add new columns to user_settings
        ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS concurso_objetivo VARCHAR(255);
        ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
        
        -- Add status to users
        ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_profile_id VARCHAR(255) REFERENCES ai_profiles(id) ON DELETE SET NULL;

        -- Insert default roles
        INSERT INTO roles (id, name, permissions) VALUES 
          ('admin', 'Administrador', '[]'::jsonb),
          ('student', 'Estudante', '[]'::jsonb),
          ('editor', 'Editor', '[]'::jsonb)
        ON CONFLICT (id) DO NOTHING;

        -- Insert default AI profile
        INSERT INTO ai_profiles (id, name, responde_prompts_per_day, responde_max_chars, redige_prompts_per_day, redige_max_chars) VALUES
          ('default-profile', 'Básico', 10, 500, 5, 1000)
        ON CONFLICT (id) DO NOTHING;

        -- Insert default user for login validation
        INSERT INTO users (id, name, email, password_hash, role_id, status, ai_profile_id) VALUES
          ('default-user', 'Lua Lima', 'lua.lima@recife.pe.gov.br', 'admin123', 'admin', 'active', 'default-profile')
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log('Database tables verified/created successfully.');
      return; // Success, exit the retry loop
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error initializing database connection or tables (attempt ${i + 1}/${retries}):`, err);
    if (i === retries - 1) {
      throw err; // Throw on last attempt
    }
    console.log(`Retrying in ${delay / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
}
