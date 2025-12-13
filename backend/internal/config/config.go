package config

import (
	"fmt"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Database struct {
	Host         string `env:"DB_HOST" env-default:"db"`
	Port         uint16 `env:"DB_PORT" env-default:"5432"`
	User         string `env:"DB_USER" env-default:"postgres"`
	Password     string `env:"DB_PASSWORD" env-required:"true"`
	Name         string `env:"DB_NAME" env-default:"postgres"`
	TLS          bool   `env:"DB_TLS" env-default:"false"`
	Connections  int    `env:"DB_POOL_CONNS" env-default:"25"`
	ConnLifetime uint   `env:"DB_CONN_LIFETIME" env-default:"0"`
}

type Logger struct {
	LogLevel string `env:"LOG_LEVEL" env-default:"debug"`
}

type JWT struct {
	Secret         string        `env:"JWT_SECRET"`
	ExpiresMinutes time.Duration `env:"JWT_EXPIRES_MINUTES"`
}

type Config struct {
	Database
	Logger
	JWT
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := cleanenv.ReadEnv(cfg); err != nil {
		return nil, fmt.Errorf("failed to load env config: %w", err)
	}

	return cfg, nil
}

func LoadEnv() (*Config, error) {
	cfg := &Config{}
	if err := cleanenv.ReadConfig(".env", cfg); err != nil {
		return nil, fmt.Errorf("failed to load env config: %w", err)
	}

	return cfg, nil
}
