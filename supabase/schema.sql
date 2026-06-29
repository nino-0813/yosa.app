-- ============================================================
-- ON:U データ層 v1（プロトタイプ） — M1: データ永続化
-- Supabase の SQL Editor にこの内容を貼って「Run」してください。
-- ============================================================

-- 顧客（LINEユーザー）
create table if not exists public.customers (
  line_user_id text primary key,
  display_name text,
  created_at   timestamptz not null default now()
);

-- 来店ごとの体調記録（1日1回 = (顧客, 日付) で一意）
create table if not exists public.visits (
  id           bigint generated always as identity primary key,
  line_user_id text not null references public.customers(line_user_id) on delete cascade,
  visited_on   date not null default current_date,
  cold     smallint not null check (cold     between 1 and 5),
  swelling smallint not null check (swelling between 1 and 5),
  sleep    smallint not null check (sleep    between 1 and 5),
  bowel    smallint not null check (bowel    between 1 and 5),
  mood     smallint not null check (mood     between 1 and 5),
  created_at timestamptz not null default now(),
  unique (line_user_id, visited_on)
);

create index if not exists visits_user_date_idx
  on public.visits (line_user_id, visited_on);

-- 権限（publishable/anon キーで読み書きできるように）
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.customers to anon, authenticated;
grant select, insert, update, delete on public.visits    to anon, authenticated;

-- RLS 有効化
alter table public.customers enable row level security;
alter table public.visits    enable row level security;

-- ⚠⚠⚠ 暫定ポリシー（プロトタイプ専用・誰でも読み書き可） ⚠⚠⚠
-- 本番（実顧客の公開）前に、LIFFトークンを検証する Edge Function 経由に切り替え、
-- このポリシーは必ず「自分の行だけ」に厳格化すること。体調・お通じ等の繊細情報のため。
drop policy if exists proto_customers_all on public.customers;
drop policy if exists proto_visits_all    on public.visits;
create policy proto_customers_all on public.customers for all to anon, authenticated using (true) with check (true);
create policy proto_visits_all    on public.visits    for all to anon, authenticated using (true) with check (true);

-- ============================================================
-- デモ用シード（ブラウザ確認用の 'demo' ユーザーに4回分）
-- 実際のLINEユーザーは空から始まる（初回体験を確認できる）
-- ============================================================
insert into public.customers (line_user_id, display_name)
values ('demo', 'ゲスト')
on conflict (line_user_id) do nothing;

delete from public.visits where line_user_id = 'demo';
insert into public.visits (line_user_id, visited_on, cold, swelling, sleep, bowel, mood) values
  ('demo', current_date - 52, 1, 2, 2, 2, 2),
  ('demo', current_date - 38, 2, 2, 3, 3, 3),
  ('demo', current_date - 22, 3, 3, 3, 2, 3),
  ('demo', current_date - 9,  3, 4, 4, 3, 4);
