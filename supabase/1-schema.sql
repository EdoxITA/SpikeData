-- Scout Volley: squadre condivise, inviti e partite
-- Incollare tutto in Supabase > SQL Editor > New query > Run

create extension if not exists pgcrypto;

create table if not exists public.teams(
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  roster jsonb not null default '{}'::jsonb,
  roster_updated bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members(
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  email text,
  created_at timestamptz not null default now(),
  primary key(team_id,user_id)
);

create table if not exists public.invites(
  code text primary key default upper(substr(md5(gen_random_uuid()::text),1,8)),
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null check (role in ('editor','viewer')),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '14 days',
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz
);

create table if not exists public.matches(
  id text primary key check (char_length(id) between 4 and 64),
  team_id uuid not null references public.teams(id) on delete cascade,
  data jsonb not null,
  status text not null default 'live' check (status in ('live','archived')),
  updated bigint not null default 0,
  updated_by uuid default auth.uid(),
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists matches_team_idx on public.matches(team_id);

-- ruolo dell'utente collegato nella squadra (null = non membro)
create or replace function public.team_role(t uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from public.team_members where team_id = t and user_id = auth.uid()
$$;

-- chi crea la squadra ne diventa proprietario
create or replace function public.on_team_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.team_members(team_id,user_id,role,email)
  values (new.id, new.created_by, 'owner', (select email from auth.users where id = new.created_by));
  return new;
end $$;
drop trigger if exists team_created on public.teams;
create trigger team_created after insert on public.teams for each row execute function public.on_team_created();

-- accetta un invito con il codice: entra nella squadra con il ruolo dell'invito
create or replace function public.accept_invite(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv public.invites; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Devi accedere prima di usare un invito'; end if;
  select * into inv from public.invites where code = upper(trim(p_code));
  if not found then raise exception 'Codice invito non valido'; end if;
  if inv.expires_at < now() then raise exception 'Invito scaduto'; end if;
  if inv.used_by is not null and inv.used_by <> uid then raise exception 'Invito già usato'; end if;
  insert into public.team_members(team_id,user_id,role,email)
  values (inv.team_id, uid, inv.role, (select email from auth.users where id = uid))
  on conflict (team_id,user_id) do update set role = case
    when public.team_members.role = 'owner' then 'owner'
    when excluded.role = 'editor' then 'editor' else public.team_members.role end;
  update public.invites set used_by = uid, used_at = now() where code = inv.code;
  return inv.team_id;
end $$;

-- crea una squadra (chi la crea ne diventa proprietario)
create or replace function public.create_team(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare tid uuid;
begin
  if auth.uid() is null then raise exception 'Devi accedere prima di creare una squadra'; end if;
  insert into public.teams(name,created_by) values (trim(p_name), auth.uid()) returning id into tid;
  return tid;
end $$;

-- il proprietario non può togliersi né lasciare la squadra senza proprietario
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
  return coalesce(new, old);
end $$;
drop trigger if exists guard_owner on public.team_members;
create trigger guard_owner before update or delete on public.team_members for each row execute function public.guard_owner();

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.invites enable row level security;
alter table public.matches enable row level security;

drop policy if exists teams_sel on public.teams;
drop policy if exists teams_ins on public.teams;
drop policy if exists teams_upd on public.teams;
drop policy if exists teams_del on public.teams;
create policy teams_sel on public.teams for select to authenticated using (public.team_role(id) is not null);
create policy teams_ins on public.teams for insert to authenticated with check (created_by = auth.uid());
create policy teams_upd on public.teams for update to authenticated using (public.team_role(id) in ('owner','editor')) with check (public.team_role(id) in ('owner','editor'));
create policy teams_del on public.teams for delete to authenticated using (public.team_role(id) = 'owner');

drop policy if exists tm_sel on public.team_members;
drop policy if exists tm_upd on public.team_members;
drop policy if exists tm_del on public.team_members;
create policy tm_sel on public.team_members for select to authenticated using (public.team_role(team_id) is not null);
create policy tm_upd on public.team_members for update to authenticated using (public.team_role(team_id) = 'owner') with check (public.team_role(team_id) = 'owner');
create policy tm_del on public.team_members for delete to authenticated using (public.team_role(team_id) = 'owner' or user_id = auth.uid());

drop policy if exists inv_sel on public.invites;
drop policy if exists inv_ins on public.invites;
drop policy if exists inv_del on public.invites;
create policy inv_sel on public.invites for select to authenticated using (public.team_role(team_id) = 'owner');
create policy inv_ins on public.invites for insert to authenticated with check (public.team_role(team_id) = 'owner' and created_by = auth.uid());
create policy inv_del on public.invites for delete to authenticated using (public.team_role(team_id) = 'owner');

drop policy if exists m_sel on public.matches;
drop policy if exists m_ins on public.matches;
drop policy if exists m_upd on public.matches;
drop policy if exists m_del on public.matches;
create policy m_sel on public.matches for select to authenticated using (public.team_role(team_id) is not null);
create policy m_ins on public.matches for insert to authenticated with check (public.team_role(team_id) in ('owner','editor'));
create policy m_upd on public.matches for update to authenticated using (public.team_role(team_id) in ('owner','editor')) with check (public.team_role(team_id) in ('owner','editor'));
create policy m_del on public.matches for delete to authenticated using (public.team_role(team_id) in ('owner','editor'));

grant select, insert, update, delete on public.teams, public.team_members, public.invites, public.matches to authenticated;
grant execute on function public.accept_invite(text), public.team_role(uuid), public.create_team(text) to authenticated;
revoke all on public.teams, public.team_members, public.invites, public.matches from anon;

-- aggiornamenti in diretta (chi segue la partita la vede muoversi)
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.matches; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.teams; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.team_members; exception when duplicate_object then null; end;
  end if;
end $$;
