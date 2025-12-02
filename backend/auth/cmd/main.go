package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"microservices/auth/internal/config"
	"microservices/auth/internal/database"
	"microservices/auth/pkg/log"
)

func main() {
	log.Info().Msg("Initialize service...")

	cfg, err := config.LoadEnv()
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	fmt.Printf("%+v\n", cfg)

	log.Set(cfg.Logger)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	db, err := database.New(cfg.Database)
	if err != nil {
		log.Fatal().Err(err).Msg("failed database creation")
	}
	defer db.Close()

	if err = db.HealthCheck(ctx); err != nil {
		log.Fatal().Err(err).Msg("couldn't open connection with the database")
	}

	// TODO: Repo connect with MySQL

	// TODO: Service for auth users

	// TODO: Transport, proto files for gRPC

	// TODO: Start gRPC server

	<-ctx.Done()
	log.Warn().Msg("Received signal. Starting graceful shutdown...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	// TODO: Graceful shutdown
	_ = shutdownCtx

	log.Info().Msg("Server stopped gracefully")
}
