-- ============================================================
-- ON:U 本番ハードニング（⚠ 最後に実行）
-- Edge Function「onu-api」をデプロイし、LINE内で記録の保存/取得が
-- 関数経由で動くことを確認してから、これを yosahp の SQL Editor で実行する。
--
-- 効果：
--  - anon（公開キー）からの onu_ テーブル直接アクセスを遮断
--  - 書き込み/読み取りは Edge Function（service_role＝RLS迂回）経由のみ
--  - 管理画面（ログイン管理者 = authenticated）は顧客タブ用に SELECT のみ可
-- ============================================================

-- 暫定（誰でも可）ポリシーを削除
drop policy if exists onu_customers_proto on public.onu_customers;
drop policy if exists onu_visits_proto    on public.onu_visits;

-- 管理画面（ログイン管理者）は閲覧のみ許可
drop policy if exists onu_customers_admin_read on public.onu_customers;
drop policy if exists onu_visits_admin_read    on public.onu_visits;
create policy onu_customers_admin_read on public.onu_customers for select to authenticated using (true);
create policy onu_visits_admin_read    on public.onu_visits    for select to authenticated using (true);

-- anon（公開キー）への直接権限を剥奪。Edge Functionは service_role なので影響なし。
revoke select, insert, update, delete on public.onu_customers from anon;
revoke select, insert, update, delete on public.onu_visits    from anon;

-- 管理者は書き換え不要なので insert/update/delete も剥奪（SELECTのみ残す）
revoke insert, update, delete on public.onu_customers from authenticated;
revoke insert, update, delete on public.onu_visits    from authenticated;
