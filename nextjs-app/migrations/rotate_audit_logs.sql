-- =============================================================================
-- Rotação de Audit Logs — Retenção de 90 dias (LGPD Art. 37)
-- =============================================================================

-- Função para limpar registros antigos do audit_logs
CREATE OR REPLACE FUNCTION fn_rotate_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Audit logs: % registros removidos (mais de % dias)', deleted_count, retention_days;
  
  RETURN deleted_count;
END;
$$;

-- Exemplo de uso manual:
-- SELECT fn_rotate_audit_logs(90);
--
-- Para agendar via pg_cron (Supabase Pro):
-- SELECT cron.schedule('rotate-audit-logs', '0 3 * * 0', 'SELECT fn_rotate_audit_logs(90)');
-- (Executa todo domingo às 3h da manhã)
