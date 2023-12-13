-- NOTE: user needs "" because its a reserved word in Postgres
-- TODO: USE THIS ONLY IN DEVELOPMENT
DROP SCHEMA IF EXISTS "user" CASCADE;

CREATE SCHEMA "user";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "user".users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NULL,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL,
  phone_number varchar(255),
  gender varchar(255) NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  UNIQUE (email)
);

CREATE TABLE "user".role (
  id SERIAL PRIMARY KEY,
  name varchar(255) NULL,
  description varchar(255) NULL,
  UNIQUE (name)
);

CREATE TABLE "user".user_roles (
  user_id UUID NOT NULL REFERENCES "user".users ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES "user".role ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE "user".blacklisted_tokens (
  id SERIAL PRIMARY KEY,
  token varchar NOT NULL,
  permanent boolean NOT NULL DEFAULT false,
  expires timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user".drivers (
  user_id UUID PRIMARY KEY REFERENCES "user".users ON DELETE CASCADE,
  short_desc varchar NOT NULL,
  long_desc varchar NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user".customers (
  user_id UUID PRIMARY KEY REFERENCES "user".users ON DELETE CASCADE,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user".sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user".users ON DELETE CASCADE,
  session_number integer,
  journalized boolean DEFAULT false,
  journalized_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  ended_at timestamp without time zone
);

CREATE TABLE "user".payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user".users ON DELETE CASCADE,
  customer_id varchar(255),
  created_at timestamp without time zone DEFAULT now() NOT NULL
);
