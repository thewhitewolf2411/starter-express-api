ALTER TABLE "user".orders
  ADD COLUMN pet_friendly BOOLEAN default false,
  ADD COLUMN card_payment BOOLEAN default false,
  ADD COLUMN reminder VARCHAR default null;