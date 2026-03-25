-- Script para criar as tabelas e colunas necessárias para os Perfis de IA

-- 1. Criar a tabela de perfis de IA
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

-- 2. Inserir um perfil padrão (se não existir)
INSERT INTO ai_profiles (id, name, responde_prompts_per_day, responde_max_chars, redige_prompts_per_day, redige_max_chars) 
VALUES ('default-profile', 'Básico', 10, 500, 5, 1000)
ON CONFLICT (id) DO NOTHING;

-- 3. Adicionar a coluna ai_profile_id na tabela users (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_profile_id VARCHAR(255) REFERENCES ai_profiles(id) ON DELETE SET NULL;

-- 4. Atualizar o usuário padrão para ter o perfil básico
UPDATE users SET ai_profile_id = 'default-profile' WHERE email = 'lua.lima@recife.pe.gov.br';

-- 5. Criar a tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method_last4 VARCHAR(4) NOT NULL,
  subscriber_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar a tabela de configurações dos agentes de IA
CREATE TABLE IF NOT EXISTS ai_agent_configs (
  id VARCHAR(255) PRIMARY KEY,
  openai_api_key TEXT,
  redis_url TEXT,
  responde_agent_config TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
