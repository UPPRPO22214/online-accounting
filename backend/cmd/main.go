package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"microservices/accounter/internal/config"
	"microservices/accounter/internal/database"
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/tokens"
	"microservices/accounter/internal/usecases"
	"microservices/accounter/pkg/logger"
)

func main() {
	logger.Info().Msg("Initialize app dependencies...")

	cfg, err := config.LoadEnv()
	if err != nil {
		logger.Fatal().Err(err).Send()
	}

	logger.Set(cfg.Logger)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	db, err := database.New(cfg.Database)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed database initialization")
	}
	defer db.Close()

	if err = db.HealthCheck(ctx); err != nil {
		logger.Fatal().Err(err).Msg("failed to open connection to database")
	}

	repo := repository.New(db.DB())

	jwt := tokens.NewJWTManager("secret", time.Hour)

	service := usecases.New(repo, jwt)

	<-ctx.Done()
	logger.Info().Msg("Received signal. Starting graceful shutdown...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	// TODO: Graceful shutdown
	_ = shutdownCtx

	logger.Info().Msg("Server stopped gracefully")
}
