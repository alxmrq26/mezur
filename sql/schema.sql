-- ============================================================
-- MEZUR · schéma Supabase
--
-- À exécuter une fois dans : Supabase → SQL Editor → New query.
--
-- Principe de sécurité : le site public utilise la clé « anon », qui
-- est visible par tout le monde dans le code de la page. Elle ne doit
-- donc jamais pouvoir LIRE les réservations, sinon n'importe quel
-- visiteur récupérerait le nom et le téléphone de tous les clients.
-- Elle peut seulement écrire. La lecture est réservée aux comptes
-- authentifiés, c'est-à-dire au back-office.
-- ============================================================

-- ---------- Réservations ----------

create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date        date        not null,
  service     text        not null check (service in ('midi', 'soir')),
  time        text        not null,
  covers      integer     not null check (covers between 1 and 30),
  occasion    text,
  nom         text        not null,
  prenom      text,
  telephone   text        not null,
  email       text,
  message     text,
  status      text        not null default 'nouvelle'
              check (status in ('nouvelle', 'confirmee', 'annulee', 'no-show'))
);

create index if not exists reservations_date_idx on public.reservations (date);
create index if not exists reservations_status_idx on public.reservations (status);

alter table public.reservations enable row level security;

-- Le public peut déposer une demande, rien d'autre.
drop policy if exists "public depose une reservation" on public.reservations;
create policy "public depose une reservation"
  on public.reservations for insert
  to anon
  with check (true);

-- Le back-office (connecté) lit et gère.
drop policy if exists "staff lit les reservations" on public.reservations;
create policy "staff lit les reservations"
  on public.reservations for select
  to authenticated
  using (true);

drop policy if exists "staff modifie les reservations" on public.reservations;
create policy "staff modifie les reservations"
  on public.reservations for update
  to authenticated
  using (true) with check (true);

drop policy if exists "staff supprime les reservations" on public.reservations;
create policy "staff supprime les reservations"
  on public.reservations for delete
  to authenticated
  using (true);


-- ---------- Demandes traiteur et privatisation ----------

create table if not exists public.traiteur_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  types       text,
  nom         text not null,
  telephone   text not null,
  email       text,
  date        date,
  guests      integer,
  message     text,
  status      text not null default 'nouvelle'
);

alter table public.traiteur_requests enable row level security;

drop policy if exists "public depose une demande traiteur" on public.traiteur_requests;
create policy "public depose une demande traiteur"
  on public.traiteur_requests for insert
  to anon
  with check (true);

drop policy if exists "staff gere les demandes traiteur" on public.traiteur_requests;
create policy "staff gere les demandes traiteur"
  on public.traiteur_requests for all
  to authenticated
  using (true) with check (true);


-- ---------- Capacité par service ----------

-- Nombre de couverts que la salle peut absorber sur un même créneau.
-- À ajuster par le restaurant.
create table if not exists public.capacite (
  service   text primary key check (service in ('midi', 'soir')),
  couverts  integer not null
);

insert into public.capacite (service, couverts)
values ('midi', 40), ('soir', 40)
on conflict (service) do nothing;

alter table public.capacite enable row level security;

drop policy if exists "capacite lisible" on public.capacite;
create policy "capacite lisible"
  on public.capacite for select
  to anon, authenticated
  using (true);


-- ---------- Disponibilité ----------

-- Renvoie, pour une date, le nombre de couverts encore libres par
-- créneau. C'est la seule information que le site public peut obtenir
-- sur les réservations existantes : aucune donnée personnelle ne sort.
-- SECURITY DEFINER permet de compter les lignes sans donner à « anon »
-- le droit de les lire.
create or replace function public.get_availability(jour date)
returns table (time text, restant integer)
language sql
security definer
set search_path = public
as $$
  select
    r.time,
    greatest(
      coalesce((select c.couverts from public.capacite c where c.service = r.service), 40)
        - sum(r.covers)::int,
      0
    ) as restant
  from public.reservations r
  where r.date = jour
    and r.status in ('nouvelle', 'confirmee')
  group by r.time, r.service;
$$;

revoke all on function public.get_availability(date) from public;
grant execute on function public.get_availability(date) to anon, authenticated;
