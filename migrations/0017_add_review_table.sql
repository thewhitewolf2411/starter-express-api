CREATE TABLE "user".review (
    id SERIAL PRIMARY KEY,
    driver_id UUID REFERENCES "user".users (id) ON DELETE SET NULL,
    user_id UUID REFERENCES "user".users (id) ON DELETE SET NULL,
    driver_review INTEGER CHECK (driver_review >= 1 AND driver_review <= 5),
    car_review INTEGER CHECK (driver_review >= 1 AND driver_review <= 5),
    drive_review INTEGER CHECK (driver_review >= 1 AND driver_review <= 5),
    created_at timestamp without time zone DEFAULT now() NOT NULL, 
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
