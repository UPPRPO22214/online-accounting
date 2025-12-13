package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"microservices/auth/internal/config"

	_ "github.com/go-sql-driver/mysql"
)

type Database struct {
	db *sql.DB
}

func New(cfg config.Database) (*Database, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?multiStatements=true&parseTime=true&tls=%t",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name, cfg.TLS,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("couldn't init the database: %w", err)
	}

	db.SetMaxOpenConns(cfg.Connections)
	db.SetMaxIdleConns(cfg.Connections)
	db.SetConnMaxLifetime(2 * time.Duration(cfg.ConnLifetime) * time.Minute)
	db.SetConnMaxIdleTime(time.Duration(cfg.ConnLifetime) * time.Minute)

	return &Database{db: db}, nil
}

func (d *Database) DB() *sql.DB {
	return d.db
}

func (d *Database) HealthCheck(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return d.db.PingContext(ctx)
}

func (d *Database) Close() error {
	if d.db != nil {
		return d.db.Close()
	}

	return nil
}
