CREATE TABLE account_members (
    account_id INT NOT NULL,
    user_id    INT NOT NULL,
    role       ENUM('viewer', 'contributor', 'admin', 'owner') NOT NULL,

    PRIMARY KEY (account_id, user_id),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
