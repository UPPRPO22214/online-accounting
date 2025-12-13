CREATE TABLE IF NOT EXISTS users (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    email            VARCHAR(64) UNIQUE NOT NULL,
    password_hash    VARCHAR(64) NOT NULL
);
