-- =============================================================================
-- CRIAR PRIMEIRO ADMIN (execute no Supabase SQL Editor)
-- Por segurança, o primeiro admin é criado diretamente no banco.
-- Substitua os valores antes de executar.
-- =============================================================================

-- Habilita pgcrypto (bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insere o primeiro admin. ALTERE os valores:
-- 'SEU_EMAIL@exemplo.com' → seu email
-- 'SUA_SENHA_AQUI'       → sua senha (mín. 4 caracteres)
-- 'Seu Nome'             → seu nome
INSERT INTO platform_admins (email, password_hash, nome)
VALUES (
  'SEU_EMAIL@exemplo.com',
  crypt('SUA_SENHA_AQUI', gen_salt('bf')),
  'Seu Nome'
)
ON CONFLICT (email) DO NOTHING;
