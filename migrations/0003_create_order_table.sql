CREATE TABLE "user".orders (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES "user".users (id) ON DELETE SET NULL,
    driver_id UUID REFERENCES "user".users (id) ON DELETE SET NULL,
    canceled boolean NOT NULL DEFAULT false,
    url varchar(255) NOT NULL,
    is_successful_payment boolean NOT NULL DEFAULT false,
    estimated_price varchar DEFAULT '0' NOT NULL,
    exact_price varchar,
    created_at timestamp without time zone DEFAULT now() NOT NULL, 
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);