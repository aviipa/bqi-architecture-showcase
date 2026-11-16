-- Função PL/pgSQL executada no Supabase Auth Hook (`before-user-created`).
-- Garante em nível de banco de dados (Defense-in-Depth) que nenhum cadastro
-- seja aceito fora dos domínios institucionais da UPE / POLI (@upe.br, @poli.br
-- e subdomínios oficiais como @ecomp.poli.br), mesmo em chamadas diretas à API.

create or replace function public.hook_restrict_signup_by_institutional_email(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  user_email text;
begin
  user_email := lower(trim(coalesce(event->'user'->>'email', '')));

  if user_email ~ '^[^[:space:]@]+@([a-z0-9-]+\.)*(upe|poli)\.br$' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'O cadastro é exclusivo para e-mails institucionais (@upe.br, @poli.br ou subdomínios oficiais).'
    )
  );
end;
$$;
