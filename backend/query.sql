-- name: GetUserByID :one
SELECT id, email
FROM users
WHERE id = ?
LIMIT 1;

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
INSERT INTO users (email, password_hash)
VALUES (?, ?);

-- name: UpdateUserPassword :execresult
UPDATE users
SET password_hash = ?
WHERE id = ?;

-- name: CreateAccount :execresult
INSERT INTO accounts (name, description, owner_id)
VALUES (?, ?, ?);

-- name: GetAccountByID :one
SELECT *
FROM accounts
WHERE id = ?
LIMIT 1;

-- name: DeleteAccountByID :exec
DELETE FROM accounts
WHERE id = ?;

-- name: AddAccountMember :exec
INSERT INTO account_members (account_id, user_id, role)
VALUES (?, ?, ?);

-- name: GetAccountMemberRole :one
SELECT role
FROM account_members
WHERE account_id = ? AND user_id = ?
LIMIT 1;

-- name: RemoveAccountMember :exec
DELETE FROM account_members
WHERE account_id = ? AND user_id = ?;

-- name: UpdateAccountMemberRole :exec
UPDATE account_members
SET role = ?
WHERE account_id = ? AND user_id = ?;

-- name: CreateTransaction :execresult
INSERT INTO transactions (
    account_id,
    user_id,
    title,
    amount,
    occurred_at,
    category,
    is_periodic
)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetTransactionByID :one
SELECT *
FROM transactions
WHERE id = ?;

-- name: ListTransactions :many
SELECT *
FROM transactions
WHERE account_id = ?

  AND (? IS NULL OR occurred_at >= ?)
  AND (? IS NULL OR occurred_at <= ?)

  AND (? IS NULL OR is_periodic = ?)

  AND (
        ? IS NULL
        OR (? = 'income' AND amount > 0)
        OR (? = 'expense' AND amount < 0)
      )

  AND (? IS NULL OR category IN (sqlc.slice('categories')))

ORDER BY occurred_at DESC;

-- name: DeleteTransactionByID :exec
DELETE FROM transactions
WHERE id = ?;
