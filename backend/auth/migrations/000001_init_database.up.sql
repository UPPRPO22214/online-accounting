CREATE TABLE IF NOT EXISTS users (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    email            VARCHAR(64) UNIQUE NOT NULL,
    password_hash    VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    user_id         INT NOT NULL,
    token_hash      VARCHAR(64) NOT NULL,
    is_refreshed    BOOLEAN NOT NULL DEFAULT FALSE,  -- флаг: был ли использован этот токен для обновления access токена
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL,
    revoked_at      TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, token_hash)
);
