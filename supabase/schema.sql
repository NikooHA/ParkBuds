-- ParkBuds shared check-ins.
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run.
-- Safe to run again: it replaces the functions and view without deleting check-ins.

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  dog_name text not null default '' check (char_length(dog_name) <= 24),
  person_name text not null default '' check (char_length(person_name) <= 24),
  -- Random value only the visitor's own browser knows; needed to edit or end the visit.
  secret uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes'
);

-- Nobody reads or writes the table directly. The site uses the view and functions below.
alter table public.checkins enable row level security;
revoke all on public.checkins from anon, authenticated;

-- Who is at the park right now (never exposes the secret).
create or replace view public.active_checkins as
  select id, dog_name, person_name, created_at, expires_at
  from public.checkins
  where expires_at > now();

revoke all on public.active_checkins from anon, authenticated;
grant select on public.active_checkins to anon, authenticated;

-- Check in. Fails with "park_full" when 30 people are already here.
create or replace function public.check_in(p_dog text, p_person text, p_secret uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  capacity constant int := 30;
  visit_length constant interval := interval '30 minutes';
  new_row public.checkins;
begin
  -- One check-in at a time, so two people can't both take the 30th spot.
  lock table public.checkins in share row exclusive mode;

  delete from public.checkins where expires_at <= now();

  if (select count(*) from public.checkins) >= capacity then
    raise exception 'park_full';
  end if;

  insert into public.checkins (dog_name, person_name, secret, expires_at)
  values (left(trim(coalesce(p_dog, '')), 24), left(trim(coalesce(p_person, '')), 24), p_secret, now() + visit_length)
  returning * into new_row;

  return json_build_object('id', new_row.id, 'expires_at', new_row.expires_at);
end;
$$;

-- Change the names on your own visit. Does not extend the visit.
create or replace function public.update_names(p_id uuid, p_secret uuid, p_dog text, p_person text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.checkins;
begin
  update public.checkins
  set dog_name = left(trim(coalesce(p_dog, '')), 24),
      person_name = left(trim(coalesce(p_person, '')), 24)
  where id = p_id and secret = p_secret and expires_at > now()
  returning * into row_out;

  if not found then
    raise exception 'visit_not_found';
  end if;

  return json_build_object('id', row_out.id, 'expires_at', row_out.expires_at);
end;
$$;

-- End your own visit ("I'm leaving").
create or replace function public.leave(p_id uuid, p_secret uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.checkins where id = p_id and secret = p_secret;
$$;

revoke all on function public.check_in(text, text, uuid) from public;
revoke all on function public.update_names(uuid, uuid, text, text) from public;
revoke all on function public.leave(uuid, uuid) from public;
grant execute on function public.check_in(text, text, uuid) to anon, authenticated;
grant execute on function public.update_names(uuid, uuid, text, text) to anon, authenticated;
grant execute on function public.leave(uuid, uuid) to anon, authenticated;
