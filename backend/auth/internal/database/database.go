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

func New(cfg *config.Config) (*Database, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?multiStatements=true&parseTime=true&tls=%s",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBTLS,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("couldn't init the database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	return &Database{db: db}, nil
}

func (d *Database) DB() *sql.DB {
	return d.db
}

func (d *Database) HealthCheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return d.db.PingContext(ctx)
}

func (d *Database) Close() error {
	if d.db != nil {
		return d.db.Close()
	}
	return nil
}
