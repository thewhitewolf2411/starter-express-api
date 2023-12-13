CREATE TABLE "user".ride_status (
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT NULL
);

INSERT INTO "user".ride_status (name) VALUES
  ('Created'),
  ('Accepted'),
  ('Started'),
  ('Ended');