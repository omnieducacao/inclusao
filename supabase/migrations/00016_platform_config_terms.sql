-- Configurações da plataforma (termo de uso, etc.)
CREATE TABLE IF NOT EXISTS platform_config (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON platform_config;
CREATE POLICY "Allow all for service" ON platform_config FOR ALL USING (true) WITH CHECK (true);

-- Valor padrão do termo
INSERT INTO platform_config (key, value)
VALUES (
  'terms_of_use',
  '1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão e deve ser utilizada exclusivamente para fins educacionais e institucionais autorizados.

2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes fora de ambientes autorizados pela instituição. O usuário se compromete a proteger qualquer informação acessada na plataforma.

3. Responsabilidade: Recomendações e conteúdos gerados pela IA são auxiliares e devem ser validados por profissionais responsáveis. A decisão final é sempre humana.

4. Segurança: Credenciais de acesso são pessoais e intransferíveis. Qualquer uso indevido deve ser comunicado à coordenação responsável.

5. Conformidade: O uso deve seguir as políticas internas da escola, legislação vigente e boas práticas de proteção de dados.'
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE platform_config IS 'Configurações globais da plataforma (termo de uso, etc.).';
