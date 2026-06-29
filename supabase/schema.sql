-- ============================================================
-- ON:U データ層（herbの本番DB「yosahp」に同居 / onu_ 接頭辞）
-- Supabase「yosahp」(qhmycdolcvuqkvncskdy) の SQL Editor で実行。
-- herb_stores / herb_reservations と同じプロジェクトに共存する。
-- ============================================================

create table if not exists public.onu_customers (
  line_user_id text primary key,
  display_name text,
  picture_url  text,
  main_purpose text,                               -- 温活/妊活/美容/自律神経/体験（初回1問・任意）
  visit_status text not null default 'new',        -- new / active / dormant など
  tags text[] not null default '{}',
  store_id text references public.herb_stores(id),  -- 同じ事業：店舗に紐づけ（任意）
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.onu_visits (
  id bigint generated always as identity primary key,
  line_user_id text not null references public.onu_customers(line_user_id) on delete cascade,
  visited_on date not null default current_date,
  cold     smallint not null check (cold     between 1 and 5),
  swelling smallint not null check (swelling between 1 and 5),
  sleep    smallint not null check (sleep    between 1 and 5),
  bowel    smallint not null check (bowel    between 1 and 5),
  mood     smallint not null check (mood     between 1 and 5),
  created_at timestamptz not null default now(),
  unique (line_user_id, visited_on)
);
create index if not exists onu_visits_user_date_idx on public.onu_visits (line_user_id, visited_on);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.onu_customers to anon, authenticated;
grant select, insert, update, delete on public.onu_visits    to anon, authenticated;

alter table public.onu_customers enable row level security;
alter table public.onu_visits    enable row level security;

-- ⚠⚠⚠ 暫定ポリシー（プロトタイプ専用・誰でも読み書き可） ⚠⚠⚠
-- 本番（実顧客の公開）前に、LIFFトークンを検証する Edge Function 経由に切り替え、
-- 「自分の行だけ」に厳格化すること。体調・お通じ等の繊細情報のため。
drop policy if exists onu_customers_proto on public.onu_customers;
drop policy if exists onu_visits_proto    on public.onu_visits;
create policy onu_customers_proto on public.onu_customers for all to anon, authenticated using (true) with check (true);
create policy onu_visits_proto    on public.onu_visits    for all to anon, authenticated using (true) with check (true);

-- デモ（ブラウザ確認用の 'demo' ユーザー）
insert into public.onu_customers (line_user_id, display_name) values ('demo','ゲスト')
on conflict (line_user_id) do nothing;
delete from public.onu_visits where line_user_id='demo';
insert into public.onu_visits (line_user_id, visited_on, cold, swelling, sleep, bowel, mood) values
  ('demo', current_date-52, 1,2,2,2,2),
  ('demo', current_date-38, 2,2,3,3,3),
  ('demo', current_date-22, 3,3,3,2,3),
  ('demo', current_date-9,  3,4,4,3,4);
