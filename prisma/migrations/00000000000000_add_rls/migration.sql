-- Row Level Security (RLS) 設定
-- Supabase使用時に有効

-- RLS有効化
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Landing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Buyer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sale" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

-- User: 自分のデータのみ読み取り可、管理者は全員参照可
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECTx
  TO authenticated
  USING (auth.uid()::text = id OR role = 'ADMIN');

-- Supplier: 認証済みユーザーは全て参照・作成可
CREATE POLICY "Authenticated users can view suppliers"
  ON "Supplier" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create suppliers"
  ON "Supplier" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON "Supplier" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Landing: 認証済みユーザーは全て参照・作成・更新可
CREATE POLICY "Authenticated users can view landings"
  ON "Landing" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create landings"
  ON "Landing" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update landings"
  ON "Landing" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Buyer: 認証済みユーザーは全て参照・作成可
CREATE POLICY "Authenticated users can view buyers"
  ON "Buyer" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create buyers"
  ON "Buyer" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update buyers"
  ON "Buyer" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sale: 認証済みユーザーは全て参照・作成可
CREATE POLICY "Authenticated users can view sales"
  ON "Sale" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sales"
  ON "Sale" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON "Sale" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoice: 認証済みユーザーは全て参照・作成・更新可
CREATE POLICY "Authenticated users can view invoices"
  ON "Invoice" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invoices"
  ON "Invoice" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON "Invoice" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
