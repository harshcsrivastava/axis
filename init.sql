CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  isbooked INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    refresh_token TEXT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 40)
WHERE NOT EXISTS (SELECT 1 FROM seats);
