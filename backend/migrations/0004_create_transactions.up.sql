CREATE TABLE transactions (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    account_id    INT NOT NULL,
    user_id       INT NOT NULL,

    title         VARCHAR(255) NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    occurred_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    category      VARCHAR(64),
    is_periodic   BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_account_date (account_id, occurred_at),
    INDEX idx_amount (amount),
    INDEX idx_category (category),
    INDEX idx_periodic (is_periodic)
);
