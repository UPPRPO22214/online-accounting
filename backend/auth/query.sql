-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = ?
LIMIT 1;

-- name: CheckUserByID :one
SELECT COUNT(*) = 1 AS user_exists
FROM users
WHERE id = ?;

-- name: CreateUser :execresult
INSERT INTO users (id, email, password_hash)
VALUES (?, ?, ?);

-- name: UpdateUserPassword :execresult
UPDATE users
SET password_hash = ?
WHERE id = ?;

-- name: GenerateRefreshToken :exec
INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
VALUES (?, ?, ?);

-- name: UseValidRefreshToken :execresult
UPDATE refresh_tokens
SET is_refreshed = TRUE
WHERE user_id = ?
      AND token_hash = ?
      AND is_refreshed = FALSE
      AND expires_at > NOW();

-- name: RevokeRefreshToken :exec
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE user_id = ? AND token_hash = ?;

-- name: GetRefreshToken :one
SELECT * FROM refresh_tokens
WHERE user_id = ? AND token_hash = ?
LIMIT 1;
