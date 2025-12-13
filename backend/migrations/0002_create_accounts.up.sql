CREATE TABLE accounts (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(128) NOT NULL,
    description TEXT,
    owner_id    INT NOT NULL,

    UNIQUE KEY uniq_owner_name (owner_id, name),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
