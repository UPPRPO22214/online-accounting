-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = ?
LIMIT 1;

-- name: CheckUserByID :one
SELECT COUNT(*) > 0 AS user_exists
FROM users
WHERE id = ?;

-- name: CreateUser :execresult
INSERT INTO users (id, email, password_hash)
VALUES (?, ?, ?);

-- name: UpdateUserPassword :execresult
UPDATE users
SET password_hash = ?
WHERE id = ?;
