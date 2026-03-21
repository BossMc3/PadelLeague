create extension if not exists "pgcrypto";

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('single_elimination', 'round_robin')),
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  elo int not null default 1200,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round int not null,
  match_number int not null,
  player1_id uuid references players(id) on delete set null,
  player2_id uuid references players(id) on delete set null,
  score1 int,
  score2 int,
  winner_id uuid references players(id) on delete set null,
  next_match_id uuid references matches(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'live', 'completed')),
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table matches;
