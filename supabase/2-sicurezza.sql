-- SpikeData: limiti di sicurezza ed eliminazione account
-- Incollare tutto in Supabase > SQL Editor > New query > Run (si può rilanciare senza problemi)

-- 1) dimensioni massime (evita che qualcuno riempia il database)
alter table public.matches drop constraint if exists matches_size;
alter table public.matches add constraint matches_size check (pg_column_size(data) < 3000000) not valid;
alter table public.teams drop constraint if exists teams_roster_size;
alter table public.teams add constraint teams_roster_size check (pg_column_size(roster) < 300000) not valid;
alter table public.team_members drop constraint if exists tm_email_len;
alter table public.team_members add constraint tm_email_len check (email is null or char_length(email) <= 320) not valid;

-- 2) limiti di quantità
create or replace function public.guard_limits() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'teams' then
    if (select count(*) from public.teams where created_by = new.created_by) >= 10 then
      raise exception 'Hai già creato il numero massimo di squadre (10)';
    end if;
  elsif tg_table_name = 'invites' then
    if (select count(*) from public.invites where team_id = new.team_id and created_at > now() - interval '1 day') >= 30 then
      raise exception 'Troppi inviti oggi per questa squadra: riprova domani';
    end if;
    if (select count(*) from public.invites where team_id = new.team_id and used_by is null and expires_at > now()) >= 50 then
      raise exception 'Troppi inviti ancora aperti per questa squadra';
    end if;
  elsif tg_table_name = 'team_members' then
    if (select count(*) from public.team_members where team_id = new.team_id) >= 60 then
      raise exception 'La squadra ha già il numero massimo di persone (60)';
    end if;
  elsif tg_table_name = 'matches' then
    if (select count(*) from public.matches where team_id = new.team_id) >= 2000 then
      raise exception 'La squadra ha raggiunto il numero massimo di partite salvate';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists limits_teams on public.teams;
create trigger limits_teams before insert on public.teams for each row execute function public.guard_limits();
drop trigger if exists limits_invites on public.invites;
create trigger limits_invites before insert on public.invites for each row execute function public.guard_limits();
drop trigger if exists limits_members on public.team_members;
create trigger limits_members before insert on public.team_members for each row execute function public.guard_limits();
drop trigger if exists limits_matches on public.matches;
create trigger limits_matches before insert on public.matches for each row execute function public.guard_limits();

-- 3) chi scrive una partita è sempre chi ha fatto l'accesso; una partita non può cambiare squadra
create or replace function public.stamp_match() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;
  if tg_op = 'UPDATE' and new.team_id <> old.team_id then
    raise exception 'Una partita non può essere spostata in un''altra squadra';
  end if;
  return new;
end $$;
drop trigger if exists stamp_match on public.matches;
create trigger stamp_match before insert or update on public.matches for each row execute function public.stamp_match();

-- una squadra non cambia proprietario-creatore
create or replace function public.lock_team_creator() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_by := old.created_by; new.id := old.id;
  return new;
end $$;
drop trigger if exists lock_team_creator on public.teams;
create trigger lock_team_creator before update on public.teams for each row execute function public.lock_team_creator();

-- nome squadra pulito
alter table public.teams drop constraint if exists teams_name_clean;
alter table public.teams add constraint teams_name_clean check (name !~ '[<>"`]') not valid;

-- 4) elimina il mio account e i miei dati
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Devi accedere prima di eliminare l''account'; end if;
  -- le squadre create da me vengono eliminate per tutti (con le loro partite)
  delete from public.teams where created_by = uid;
  delete from public.invites where created_by = uid;
  delete from public.team_members where user_id = uid;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- la funzione di controllo del proprietario lascia passare l'eliminazione dell'account
create or replace function public.guard_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' and old.role = 'owner' then
    if (select count(*) from public.team_members where team_id = old.team_id and role = 'owner') <= 1
       and exists (select 1 from public.teams where id = old.team_id) then
      raise exception 'La squadra deve avere almeno un proprietario';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.role = 'owner' and new.role <> 'owner' then
    if (select count(*) from public.team_members where team_id = old.team_id and role = 'owner') <= 1 then
      raise exception 'La squadra deve avere almeno un proprietario';
    end if;
  end if;
  if tg_op = 'UPDATE' and (new.team_id <> old.team_id or new.user_id <> old.user_id) then
    raise exception 'Operazione non consentita';
  end if;
  return coalesce(new, old);
end $$;
