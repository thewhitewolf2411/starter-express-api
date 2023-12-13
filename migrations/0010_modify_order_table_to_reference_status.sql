ALTER TABLE "user".orders
  ADD COLUMN status_id SERIAL REFERENCES "user".ride_status (id) ON DELETE SET NULL;