-- SpikeData: funzione "ping" per tenere attivo il progetto Supabase gratuito
-- (il piano free va in pausa dopo 7 giorni senza attività).
-- Non legge né scrive dati: restituisce solo 1.
-- Viene chiamata ogni 6 ore da cron-job.org:
--   GET https://<progetto>.supabase.co/rest/v1/rpc/keepalive?apikey=<chiave pubblicabile>
create or replace function public.keepalive() returns integer
language sql stable security invoker set search_path = ''
as $$ select 1 $$;
revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
